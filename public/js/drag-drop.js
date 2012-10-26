var DragDrop = function($element, options) {
	// handlers
	this.redraw = function(dd){};
	this.start  = function(dd){};
	this.stop   = function(dd){};
	$.extend(this, options || {});

	var t = this;

	var startX = 0;
	var startY = 0;
	var currentX = 0;
	var currentY = 0;



	//
	// PUBLIC INTERFACE
	//

	this.deltaX = function() { return currentX - startX; };
	this.deltaY = function() { return currentY - startY; };



	//
	// INITIALIZATION
	//

	var mup = function(e) {
		// stop tracking
		$(document)
			.unbind('mouseup', mup)
			.unbind('mousemove', mmv);

		currentX = e.pageX;
		currentY = e.pageY;
		t.redraw(t);
		t.stop(t);
	};

	var mmv = function(e) {
		currentX = e.pageX;
		currentY = e.pageY;
		t.redraw(t);
	};

	$element.bind('mousedown', function(e) {
		// start tracking
		$(document)
			.bind('mouseup', mup)
			.bind('mousemove', mmv);

		startX = e.pageX;
		startY = e.pageY;
		currentX = e.pageX;
		currentY = e.pageY;
		t.start(t);
	});
};
