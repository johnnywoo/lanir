var Token = function(options) {
	// public options
	this.size  = [1, 1]; // cells [hor, ver]
	this.place = [0, 0]; // coords of left top square of the token
	this.image = '';
	this.name  = '';
	this.color = '#004108';

	// filled by the map
	this.map   = null;
	this.mapId = null;
	$.extend(this, options || {});



	//
	// PUBLIC INTERFACE
	//

	this.remove = function() {
		this.map.removeToken(this.mapId);
	};
	this.redraw = function() {
		this.map.drawToken(this.mapId);
	};
	this.move = function(place) {
		this.map.moveToken(this.mapId, place);
	};
	this.render = function() {
		var $box;
		if(this.image != '') {
			// image-based token
			$box = $('<div class="token-image-body" />');
			$box.css('background', 'url("' + this.image + '") left top no-repeat');
			$box.css('background-size', '100% 100%');
		} else {
			// text-based token
			$box = $('<div class="token-text-body" />');
			$box.text(this.name.substring(0, 1));
			$box.css('background-color', this.color);
			$box.css('color', 'white');
		}

		$box.append($('<span class="token-name" />').append($('<span />').text(this.name)));
		return $box;
	};
};
