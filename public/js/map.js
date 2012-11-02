var Map = function(options) {
	this.$container = null;
	this.size       = [25, 20]; // cells [horizontal, vertical]
	this.mapImage   = '';

	this.zoomLevels = [
		// cell size in pixels: canvas class
		// the array must be sorted!
		[0,   'map-zoom-out'],
		[50,  'map-zoom-in'],
		[100, 'map-zoom-microscope']
	];
	this.zoomSpeed = 0.15; // 0.15 is 15% of width/height increase per mouse wheel tick
	$.extend(this, options || {});



	//
	// PUBLIC INTERFACE
	//

	this.removeZoom = function() {
		removeZoom();
	};

	this.centerView = function() {
		centerView();
	};

	/**
	 * @param {Token} token
	 * @return {number} id
	 */
	this.addToken = function(token) {
		return addToken(token);
	};

	/**
	 * @param {number} id
	 */
	this.removeToken = function(id) {
		removeToken(id);
	};



	//
	// INITIALIZATION
	//

	var $canvas; // the whole map
	var t = this;


	// DRAWING

	if(this.$container == null) {
		throw 'No element to draw the map into!';
	}

	var gridW = this.size[0];
	var gridH = this.size[1];

	var $e = this.$container;
	// delete everything inside the canvas
	$e.empty();

	// the container receives a canvas div that will hold all layers of the map
	// it is set to a fixed size using 1em = 1 grid square
	$canvas = $('<div class="map-canvas" />');
	$canvas.css({
		'width':  gridW + 'em',
		'height': gridH + 'em'
	});
	if(this.mapImage != '') {
		$canvas.css({
			'background':      'url("' + this.mapImage + '") left top no-repeat',
			'background-size': gridW + 'em ' + gridH + 'em' // must be set after the image
		});
	}
	$e.append($canvas);

	// the grid layer
	var grid = new MapGrid(gridW, gridH);
	$canvas.append(grid.draw());
	var getCellCoordsFromPoint = function(x, y, correctionShift) {
		correctionShift = correctionShift || [0, 0];
		var place = grid.getCellCoordsFromPoint(x, y);
		return [
			place[0] + correctionShift[0],
			place[1] + correctionShift[1]
		];
	};

	// here is where the tokens go
	var $tokenLayer = $('<div class="tokens" />');
	$canvas.append($tokenLayer);



	// PANNING THE MAP

	new DragDrop(this.$container, {
		ignoreCancel: true,
		mouseButtons: [DragDrop.BTN_LEFT, DragDrop.BTN_MIDDLE],
		start: function(dd) {
			var offset = $canvas.offset();
			dd.xTop  = offset.top;
			dd.xLeft = offset.left;
		},
		redraw: function(dd) {
			$canvas.css({
				left: dd.xLeft + dd.deltaX(),
				top:  dd.xTop  + dd.deltaY()
			});
		}
	});
	var centerView = function() {
		var contW = t.$container.width();
		var contH = t.$container.height();
		$canvas.css({
			left: ((contW - $canvas.width()) / 2) + 'px',
			top:  ((contH - $canvas.height()) / 2) + 'px'
		});
	};
	var moveCanvas = function(moveX, moveY) {
		var offset = $canvas.offset();
		$canvas.css({
			left: (offset.left + Math.round(moveX)) + 'px',
			top:  (offset.top  + Math.round(moveY)) + 'px'
		});
	};


	// ZOOM

	var defaultZoomAmount = null;
	var zoomStep = null;
	var syncZoomClass = function() {
		var pixels = grid.getCellWidth();
		var classes = [];
		var foundClass = '';
		for(var i = 0; i < t.zoomLevels.length; i++) {
			var zoomLevel = t.zoomLevels[i]; // [pixels, class]
			classes.push(zoomLevel[1]);
			if(pixels > zoomLevel[0]) {
				foundClass = zoomLevel[1];
			}
		}
		if(!$canvas.hasClass(foundClass)) {
			$canvas.removeClass(classes.join(' ')).addClass(foundClass);
		}
	};
	// sync it on init
	syncZoomClass();
	this.$container.mousewheel(function(e, delta) {
		var curZoom = parseInt($canvas.css('font-size')) || 42; // arbitrary default fallback, sue me
		if(defaultZoomAmount == null) {
			defaultZoomAmount = curZoom;
			// unfortunately, simple percentage zoom will cause uneven zooming
			// (zoom in + zoom out = not the size we started with)
			// so we need to calculate a step value once and use it to zoom in a linear fashion
			zoomStep = Math.round(defaultZoomAmount * t.zoomSpeed);
		}
		// delta will be 0.3 * n where n is a signed int
		var zoom = curZoom + Math.round(zoomStep * delta * 3);

		$canvas.css('font-size', zoom + 'px');
		syncZoomClass();

		// now we need to compensate canvas coords so the zoom doesn't shift the viewport
		// what we have here is:
		// size changed from oldW to newW
		// coord of point under cursor shifts from X to `X * newW / oldW` where X is coords on canvas
		// pointer has pageX relative to the page, canvas has offsetX relative to the page
		// therefore `X = pageX - offsetX` and new coord of the point is `(pageX - offsetX) * newW / oldW`
		// we can substitute `newW/oldW` with `zoom/curZoom` because font size is proportional to the width
		// new offset will then be `pageX - (zoom/curZoom) * (pageX - offsetX)`
		// the final formula reads:
		// shiftX = (1 - zoom/curZoom) * (pageX - offsetX)
		var k = 1 - zoom / curZoom;
		var offset = $canvas.offset();
		moveCanvas(
			Math.round(k * (e.pageX - offset.left)),
			Math.round(k * (e.pageY - offset.top))
		);
	});
	var removeZoom = function() {
		if(defaultZoomAmount != null) {
			$canvas.css('font-size', defaultZoomAmount + 'px');
			syncZoomClass();
		}
	};


	// TOKENS

	var tokens = [];
	var addToken = function(token) {
		var tokenId = -1 + tokens.push(token);

		$tokenLayer.append(token.$box);
		token.render();

		// dragging the token around
		new DragDrop(token.$box, {
			start: function(dd) {
				dd.xStartPlace = token.place.slice(0); // clone the array
				dd.xLastPlace  = token.place.slice(0); // clone the array
				// we might have grabbed the token not by its top left corner, so let's adjust for it
				var grabPlace = getCellCoordsFromPoint(dd.currentX, dd.currentY);
				dd.xCorrectionShift = [
					token.place[0] - grabPlace[0],
					token.place[1] - grabPlace[1]
				];
				var arrow = new ShapeArrow();
				arrow.start(dd.xStartPlace);
				dd.xArrow = arrow;

				token.$box.css({'z-index': maxZIndex + 1});
			},
			otherclick: function(dd) {
				var place = getCellCoordsFromPoint(dd.currentX, dd.currentY, dd.xCorrectionShift);
				dd.xArrow.point(place);
			},
			redraw: function(dd) {
				var place = getCellCoordsFromPoint(dd.currentX, dd.currentY, dd.xCorrectionShift);
				if(place[0] != dd.xLastPlace[0] || place[1] != dd.xLastPlace[1]) {
					dd.xLastPlace = place.slice(0); // clone the array

					// adjust the arrow
					dd.xArrow.end(place);

					// redraw the arrow
					dd.x$arrowBox && dd.x$arrowBox.remove();
					dd.x$arrowBox = dd.xArrow.draw();
					$tokenLayer.append(dd.x$arrowBox);

					// we cannot redraw here!
					// on redraw the DragDrop object will be recreated with the token
					// and the whole thing explodes with weird effects
					token.move(place);
					token.set({counter: dd.xArrow.getLength()});
				}
			},
			cancel: function(dd) {
				dd.stop(dd);
				token.move(dd.xStartPlace);
			},
			stop: function(dd) {
				dd.x$arrowBox && dd.x$arrowBox.remove();
				token.set({counter: ''});
				normalizeTokenZIndices();
			}
		});

		return tokenId;
	};
	var removeToken = function(id) {
		if(tokens[id] != undefined) {
			tokens[id].destroy();
		}
		delete tokens[id];
	};
	var zeroZIndex = 10;
	var maxZIndex = zeroZIndex;
	var normalizeTokenZIndices = function() {
		var list = [];
		$.each(tokens, function(id, token) {
			list.push([
				token.$box.css('z-index'),
				token
			]);
		});
		// sort by z-index asc
		list.sort(function(a, b) {return a[0] - b[0]});
		for(var i = 0; i < list.length; i++) {
			list[i][1].$box.css('z-index', zeroZIndex + i);
		}
		maxZIndex = zeroZIndex + i;
	};
};
