var FogOfWar = function(options) {
	/** @type {jQuery} */
	this.$container = null;
	/** @type {Map} */
	this.map        = null;
	$.extend(this, options || {});

	var size = 100; // this is essentially graphics quality; actual onscreen size is managed by css (1 em = 1 cell)

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.toggle = function() {
		$canvas.toggle();
	};

	this.draw = function() {
		var visibleArea = [];
		$.each(t.map.getTokens(), function(id, token) {
			$.merge(visibleArea, token.getVisibleArea());
		});

		var w = t.map.size[0];
		var h = t.map.size[1];

		$canvas
			// resetting the size erases the canvas, which is quite fortunate
			.attr({
				width:  size * w,
				height: size * h
			})
			.css({
				width:  w + 'em',
				height: h + 'em'
			});

		for(var x = 0; x < w; x++) {
			for(var y = 0; y < h; y++) {
				if($.inArray(x + '_' + y, visibleArea) == -1) {
					ctx.fillRect(x * size, y * size, size, size);
				}
			}
		}
	};



	//
	// INITIALIZATION
	//

	if(this.$container == null) {
		throw 'No element to draw the fog of war into!';
	}

	var $canvas = $('<canvas class="fog-of-war" />');
	this.$container.append($canvas);
	var ctx = $canvas[0].getContext('2d');
};
