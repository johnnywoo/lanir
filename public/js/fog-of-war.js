var FogOfWar = function(options) {
	/** @type {jQuery} */
	this.$container = null;
	/** @type {Map} */
	this.map        = null;
	$.extend(this, options || {});

	if(this.$container == null) {
		throw 'No element to draw the fog of war into!';
	}

	var t = this;

	var $canvas = $('<canvas class="fog-of-war" />');
	this.$container.append($canvas);
	var ctx = $canvas[0].getContext('2d');

	var size = 100; // this is essentially graphics quality; actual onscreen size is managed by css (1 em = 1 cell)

	this.toggle = function() {
		$canvas.toggle();
	};

	this.draw = function() {
		var visibleArea = [];
		$.each(t.map.getTokens(), function(id, token) {
			$.merge(visibleArea, token.getVisibleArea());
		});

		// just in case the map changed size
		var w = t.map.size[0];
		var h = t.map.size[1];
		$canvas.attr({
			width:  size * w,
			height: size * h
		}).css({
			width:  w + 'em',
			height: h + 'em'
		});

		for(var x = 0; x < w; x++) {
			for(var y = 0; y < h; y++) {
				if($.inArray((x + '_' + y), visibleArea) == -1) {
					ctx.fillRect(x * size, y * size, size, size);
				}
			}
		}
	};
};
