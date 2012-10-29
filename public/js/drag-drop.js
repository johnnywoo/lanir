var DragDrop = function($element, options) {
	// handlers
	this.redraw = null;
	this.start  = null;
	this.stop   = null;
	this.cancel = null;
	this.ignoreCancel = false;
	$.extend(this, options || {});

	var t = this;

	this.startX = 0;
	this.startY = 0;
	this.currentX = 0;
	this.currentY = 0;

	// on drag start, 'start' will be called
	// while dragging, 'redraw' will be called
	// if ESC is pressed while dragging, 'cancel' will be called; if it's empty, 'stop' will be called instead
	// if ESC was not pressed, after the mouse up 'stop' will be called



	//
	// PUBLIC INTERFACE
	//

	this.deltaX = function() { return t.currentX - t.startX; };
	this.deltaY = function() { return t.currentY - t.startY; };



	//
	// INITIALIZATION
	//

	var stopTracking = function(e) {
		// stop tracking
		$(document)
			.unbind('mouseup', mouseup)
			.unbind('mousemove', mousemove)
			.unbind('keydown', keydown);

		t.currentX = e.pageX;
		t.currentY = e.pageY;
	};

	var mouseup = function(e) {
		stopTracking(e);

		t.redraw && t.redraw(t);
		t.stop && t.stop(t);
	};

	var mousemove = function(e) {
		t.currentX = e.pageX;
		t.currentY = e.pageY;

		t.redraw && t.redraw(t);
	};

	var keydown = function(e) {
		if(e.which == 27) { // esc
			stopTracking(e);

			t.redraw && t.redraw(t);

			if(t.cancel) {
				t.cancel(t);
			} else if(t.stop) {
				t.stop(t);
			}
		}
	};

	$element.bind('mousedown', function(e) {
		e.stopPropagation(); // prevent multiple drags from starting

		// start tracking
		// we only add the document handlers for the time we're actually dragging
		// so hopefully the whole drag-drop harness can be destroyed if the element is removed
		$(document)
			.bind('mouseup', mouseup)
			.bind('mousemove', mousemove);
		if(!t.ignoreCancel) {
			$(document).bind('keydown', keydown);
		}

		t.startX = e.pageX;
		t.startY = e.pageY;
		t.currentX = e.pageX;
		t.currentY = e.pageY;

		t.start && t.start(t);
	});
};
