var DragDrop = function($element, options) {
	// handlers (all handlers take a function(dd) where dd is the DragDrop object)
	this.redraw     = null;
	this.start      = null;
	this.stop       = null;
	this.cancel     = null;
	this.otherclick = null; // click with other mouse button while dragging
	// properties
	this.ignoreCancel = false;
	this.mouseButtons = [DragDrop.BTN_LEFT]; // buttons that can initiate the drag
	$.extend(this, options || {});

	var t = this;
	var isActive = false;
	var dragStartedMouseButton = 0;

	this.startX = 0;
	this.startY = 0;
	this.currentX = 0;
	this.currentY = 0;

	// handler rules:
	// * on drag start, 'start' will be called (return false to prevent drag from starting)
	// * while dragging, 'redraw' will be called
	// * if there is a 'otherclick' handler and anonther mouse button is pressed while dragging, it will be called
	// * if ESC is pressed while dragging, 'cancel' will be called; if it's empty, 'stop' will be called instead
	// * if ESC was not pressed, after the mouse up 'stop' will be called



	//
	// PUBLIC INTERFACE
	//

	this.deltaX = function() {
		return t.currentX - t.startX;
	};
	this.deltaY = function() {
		return t.currentY - t.startY;
	};



	//
	// INITIALIZATION
	//

	var initDrag = function(e) {
		isActive = true;
		dragStartedMouseButton = e.which;

		t.startX = e.pageX;
		t.startY = e.pageY;
		t.currentX = e.pageX;
		t.currentY = e.pageY;
	};

	var startTracking = function(e) {
		// we only add the document handlers for the time we're actually dragging
		// so hopefully the whole drag-drop harness can be destroyed if the element is removed
		var $doc = $(document);
		$doc
			.bind('mouseup', mouseup)
			.bind('mousemove', mousemove);

		if(!t.ignoreCancel) {
			$doc.bind('keydown', keydown);
		}

		// if we have an 'otherclick' handler, we need to disable mouse events on all elements
		// because dragging means the cursor will get out of our own element and
		// it's entirely possible that another drag handler will try to start
		if(t.otherclick) {
			// we need to put our handler at the very bottom of the bubbling
			// so delegation to document is unfortunately not an option
			$('*').bind('mousedown mouseup', bubbleInterceptor);
			// also we need to disable the context menu so the right click won't bring it up
			$doc.bind('contextmenu', disableContextMenu);
		}
	};

	var stopTracking = function(e) {
		isActive = false;

		t.currentX = e.pageX;
		t.currentY = e.pageY;

		$(document)
			.unbind('mouseup', mouseup)
			.unbind('mousemove', mousemove)
			.unbind('contextmenu', disableContextMenu)
			.unbind('keydown', keydown);

		if(t.otherclick) {
			$('*').unbind('mousedown mouseup', bubbleInterceptor);
		}
	};

	var bubbleInterceptor = function(e) {
		e.stopPropagation();
		if(e.type == 'mousedown') {
			mousedown(e);
		} else {
			mouseup(e);
		}
	};

	var disableContextMenu = function() {
		return false;
	};

	var mouseup = function(e) {
		if(dragStartedMouseButton == e.which) {
			stopTracking(e);

			t.redraw && t.redraw(t);
			t.stop && t.stop(t);
		}
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
			t.cancel ? t.cancel(t) : (t.stop && t.stop(t));
		}
	};

	var mousedown = function(e) {
		if(!isActive) {
			// drag started! only if a correct button is pressed, of course
			if($.inArray(e.which, t.mouseButtons) > -1) {
				e.stopPropagation(); // prevent multiple drags from starting at once
				initDrag(e);
				if(t.start && t.start(t) === false) {
					// nope, we're shutting the whole thing down again
					isActive = false;
					return;
				}
				startTracking(e);
			}
		} else if(t.otherclick && dragStartedMouseButton != e.which) {
			// already active = possibility for an otherclick
			e.stopPropagation(); // prevent random weirdness from happening
			t.otherclick(t);
		}
	};

	$element.bind('mousedown', mousedown);
	// if we want to start the drag on a right click, we need to disable the context menu
	if($.inArray(DragDrop.BTN_RIGHT, t.mouseButtons) > -1) {
		$element.bind('contextmenu', disableContextMenu);
	}
};

// constants
DragDrop.BTN_LEFT   = 1;
DragDrop.BTN_MIDDLE = 2;
DragDrop.BTN_RIGHT  = 3;
