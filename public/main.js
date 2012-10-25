
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
		size:       [20, 15], // cells [horizontal, vertical]
		cellWidth:  35, // px
		cellHeight: 35 // px
	};
	$.extend(this.options, options || {});

	var $canvas; // the whole map

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

	var setupCanvasZooming = function($area, $zoomedBox) {
		$area.mousewheel(function(event, delta, deltaX, deltaY) {
			// delta will be 0.3
			var curZoom = parseFloat($zoomedBox.css('-moz-transform').replace(/^.*?\(([0-9.]+).*?$/, '$1'));
			if(isNaN(curZoom)) {
				curZoom = 1;
			}
			var zoom = curZoom + delta / 5;
			$canvas.css({
				'zoom':              zoom,
				'-moz-transform':    'scale('+zoom+')',
				'-webkit-transform': 'scale('+zoom+')'
			});
		});
	};

	this.centerView = function() {
		var contW = parseInt(this.options.$container.css('width'));
		var contH = parseInt(this.options.$container.css('height'));
		$canvas.css({
			left: ((contW - parseInt($canvas.css('width'))) / 2) + 'px',
			top:  ((contH - parseInt($canvas.css('height'))) / 2) + 'px'
		});
		// remove zoom
		$canvas.css({
			'zoom':              '1',
			'-moz-transform':    'scale(1)',
			'-webkit-transform': 'scale(1)'
		});
	};

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
			width:  this.options.cellWidth * gridW,
			height: this.options.cellHeight * gridH
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
					top:    (this.options.cellHeight * h) + 'px',
					left:   (this.options.cellWidth * w) + 'px',
					width:  this.options.cellWidth,
					height: this.options.cellHeight
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
	map.centerView();

	$('#centerViewBtn').click(function(){
		map.centerView();
	})
});

