var FogOfWar = function(options) {
	/** @type {jQuery} */
	this.$container = null;
	/** @type {Map} */
	this.map        = null;
	$.extend(this, options || {});

	// this is essentially graphics quality; actual onscreen size is managed by css (1 em = 1 cell)
	// setting size to 1 produces awesome blurring of the fog
	var size = 1;

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.toggle = function() {
		$canvas.toggle();
	};

	this.show = function() {
		$canvas.show();
	};

	this.draw = function(visibleArea) {
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

	t.draw([]); // black screen on init
	t.show();
};
