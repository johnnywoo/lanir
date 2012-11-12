var FogOfWar = function(options) {
	this.$container = null;
	this.ctx = null;
	this.map = null;
	$.extend(this, options || {});

	if(this.$container == null) {
		throw 'No element to draw the map into!';
	}

	var $e = this.$container;

	$canvas = $('<canvas class="fog-of-war" />');
	$e.append($canvas);
	this.ctx = $canvas[0].getContext('2d');
	var t = this;
	t.ctx.save();

	this.draw = function() {
		var tokens = t.map.getTokens();
		var visibleArea = [];
		$.each(tokens, function(i, item) {
			$.merge(visibleArea, item.getVisibleArea());
		});

		$canvas[0].setAttribute('width', t.$container.width());
		$canvas[0].setAttribute('height', t.$container.height());
		t.ctx.restore();
		t.ctx.save();

		var w = t.$container.width() / t.map.size[0];
		var h = t.$container.height() / t.map.size[1];

		for(x = 0; x < t.map.size[0]; x++) {
			for(y = 0; y < t.map.size[1]; y++) {
				if($.inArray((x + '_' + y), visibleArea) == -1) {
					t.ctx.fillRect(x * w, y * h, w, h);
				}
			}
		}
	};
};
