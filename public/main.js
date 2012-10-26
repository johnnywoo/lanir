
// to do
//
// UI:
// zooming the grid
// dragging the grid
// tools, tool selection
// drawer on the right
// tokens
// selecting tokens
// dragging tokens

var DragDrop = function($element) {
	// handlers
	this.redraw = function(dd){};
	this.start  = function(dd){};
	this.stop   = function(dd){};

	// readonly
	this.startPos   = {x: 0, y: 0};
	this.currentPos = {x: 0, y: 0};

	var t = this;

	var mup = function(e){
		// stop tracking
		$(document)
			.unbind('mouseup', mup)
			.unbind('mousemove', mmv);

		t.currentPos.x = e.pageX;
		t.currentPos.y = e.pageY;
		t.redraw(t);
		t.stop(t);
	};

	var mmv = function(e){
		t.currentPos.x = e.pageX;
		t.currentPos.y = e.pageY;
		t.redraw(t);
	};

	$element.mousedown(function(e){
		// start tracking
		$(document)
			.bind('mouseup', mup)
			.bind('mousemove', mmv);

		t.startPos.x = e.pageX;
		t.startPos.y = e.pageY;
		t.currentPos.x = e.pageX;
		t.currentPos.y = e.pageY;
		t.start(t);
	});
};

var Map = function(options) {
	this.options = {
		$container: null,
		size:       [23, 19] // cells [horizontal, vertical]
	};
	$.extend(this.options, options || {});

	var $canvas; // the whole map



	//
	// DRAGGING
	//

	var setupCanvasDragging = function($area, $draggedBox) {
		var dd = new DragDrop($area);
		dd.start = function() {
			dd.xTop  = parseInt($draggedBox.css('top'));
			dd.xLeft = parseInt($draggedBox.css('left'));
		};
		dd.redraw = function() {
			$draggedBox.css({
				left: dd.xLeft + this.currentPos.x - this.startPos.x,
				top:  dd.xTop  + this.currentPos.y - this.startPos.y
			});
		};
	};

	this.centerView = function() {
		var contW = parseInt(this.options.$container.css('width'));
		var contH = parseInt(this.options.$container.css('height'));
		$canvas.css({
			left: ((contW - parseInt($canvas.css('width'))) / 2) + 'px',
			top:  ((contH - parseInt($canvas.css('height'))) / 2) + 'px'
		});
	};



	//
	// ZOOM
	//

	var defaultZoomAmount = null;
	var zoomDelta = null;
	var setupCanvasZooming = function($area, $zoomedBox) {
		$area.mousewheel(function(event, delta, deltaX, deltaY) {
			// delta will be 0.3
			var curZoom = parseInt($zoomedBox.css('font-size')) || 30; // arbitrary default fallback, sue me
			if(defaultZoomAmount == null) {
				defaultZoomAmount = curZoom;
				// unfortunately, simple percentage zoom will cause uneven zooming
				// (zoom in + zoom out = not the size we started with)
				// so we need to calculate a step value once and use it to zoom in a linear fashion
				zoomDelta = Math.round(defaultZoomAmount * 0.05); // 5 percent per tick
			}
			var zoom = curZoom + zoomDelta * Math.round(delta * 3);
			$zoomedBox.css('font-size', zoom + 'px');
		});
	};
	this.removeZoom = function() {
		if(defaultZoomAmount != null) {
			$canvas.css('font-size', defaultZoomAmount + 'px');
		}
	};



	//
	// DRAW
	//

	this.draw = function() {
		if(this.options.$container == null) {
			throw 'No element to draw the map into!';
		}

		var gridW = this.options.size[0];
		var gridH = this.options.size[1];

		var $e = this.options.$container;
		// delete everything inside the canvas
		$e.empty();
		// ok, let's start filling it with a wrapper
		$canvas = $('<div class="map-canvas" />');
		$canvas.css({
			width:  gridW + 'em',
			height: gridH + 'em'
		});
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

		// navigation
		setupCanvasDragging($e, $canvas);
		setupCanvasZooming($e, $canvas);
	};
};

$(function(){

	var map = new Map({
		$container: $('#canvas')
	});

	map.draw();
	map.removeZoom();
	map.centerView();

	$('#centerViewBtn').click(function(){
		map.removeZoom();
		map.centerView();
	});

	$(document).bind('keydown', 'ctrl+0 meta+0', function() {
		map.removeZoom();
		map.centerView();
	});
});

