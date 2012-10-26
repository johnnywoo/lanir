var Map = function(options) {
	this.$container = null;
	this.size =       [25, 20]; // cells [horizontal, vertical]
	this.mapImage =   '';
	$.extend(this, options || {});



	//
	// PUBLIC INTERFACE
	//
	var removeZoom, centerView;
	this.removeZoom = function() {removeZoom();};
	this.centerView = function() {centerView();};



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

	// tokens over the grid... maybe later


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
	});
	removeZoom = function() {
		if(defaultZoomAmount != null) {
			$canvas.css('font-size', defaultZoomAmount + 'px');
		}
	};
};
