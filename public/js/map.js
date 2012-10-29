var Map = function(options) {
	this.$container = null;
	this.size       = [25, 20]; // cells [horizontal, vertical]
	this.mapImage   = '';

	this.zoomLevels = [
		// cell size in pixels: canvas class
		// the array needs to be sorted!
		[0,   'map-zoom-out'],
		[50,  'map-zoom-in'],
		[100, 'map-zoom-microscope']
	];
	$.extend(this, options || {});



	//
	// PUBLIC INTERFACE
	//

	var removeZoom, centerView, addToken, drawToken, removeToken;
	this.removeZoom  = function() {removeZoom();};
	this.centerView  = function() {centerView();};
	this.addToken    = function(token) {addToken(token);};
	this.drawToken   = function(id) {drawToken(id);};
	this.removeToken = function(id) {removeToken(id);};



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

	// map layers... maybe later

	// the last and foremost is the grid layer
	var $grid = $('<div class="map-grid" />');
	// filling the grid with squares
	for(var w = 0; w < gridW; w++) {
		for(var h = 0; h < gridH; h++) {
			var $cell = $('<div class="map-grid-cell" />');
			$cell.css({
				top:  h + 'em',
				left: w + 'em'
			});
			$grid.append($cell);
		}
	}
	$canvas.append($grid);

	var $tokenLayer = $('<div class="tokens" />');
	$canvas.append($tokenLayer);


	// DRAGGING
	new DragDrop(this.$container, {
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
	centerView = function() {
		var contW = t.$container.width();
		var contH = t.$container.height();
		$canvas.css({
			left: ((contW - parseInt($canvas.css('width'))) / 2) + 'px',
			top:  ((contH - parseInt($canvas.css('height'))) / 2) + 'px'
		});
	};


	// ZOOM

	var defaultZoomAmount = null;
	var zoomDelta = null;
	var syncZoomClass = function() {
		var pixels = $grid.children(":first").width();
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
		// delta will be 0.3 * n where n is a signed int
		var curZoom = parseInt($canvas.css('font-size')) || 42; // arbitrary default fallback, sue me
		if(defaultZoomAmount == null) {
			defaultZoomAmount = curZoom;
			// unfortunately, simple percentage zoom will cause uneven zooming
			// (zoom in + zoom out = not the size we started with)
			// so we need to calculate a step value once and use it to zoom in a linear fashion
			zoomDelta = Math.round(defaultZoomAmount * 0.05); // 5 percent per tick
		}
		var zoom = curZoom + zoomDelta * Math.round(delta * 3);
		$canvas.css('font-size', zoom + 'px');
		syncZoomClass();
	});
	removeZoom = function() {
		if(defaultZoomAmount != null) {
			$canvas.css('font-size', defaultZoomAmount + 'px');
			syncZoomClass();
		}
	};


	// TOKENS

	var tokens = [];
	var tokenBoxes = []; // list of jQuery objects
	drawToken = function(id) {
		// removing the old box
		if(tokenBoxes[id]) {
			tokenBoxes[id].remove();
			delete tokenBoxes[id];
		}
		if(tokens[id] == undefined) {
			return;
		}

		// drawing the new box
		var token = tokens[id];
		var $box = $('<div class="token" />');
		$box.append(token.render());
		$box.css({
			width:  token.size[0] + 'em',
			height: token.size[1] + 'em',
			left:   token.place[0] + 'em',
			top:    token.place[1] + 'em'
		});
		$tokenLayer.append($box);
	};
	addToken = function(token) {
		token.map = t;
		token.mapId = -1 + tokens.push(token);
		drawToken(token.mapId);
	};
	removeToken = function(id) {
		if(tokens[id] != undefined) {
			// detach it from the map
			tokens[id].map   = null;
			tokens[id].mapId = null;
		}
		delete tokens[id];
		drawToken(id); // will remove the token box
	}
};
