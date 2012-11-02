var Token = function(options) {
	// public options
	this.size  = [1, 1]; // cells [hor, ver]
	this.place = [0, 0]; // coords of left top square of the token
	this.image = '';
	this.name  = '';
	this.text  = '';
	this.color = '#004108';

	// filled by the map
	this.mapId = null;

	$.extend(this, options || {});


	this.$box = $('<div class="token" />');
	this.$box.css({
		width:  this.size[0] + 'em',
		height: this.size[1] + 'em',
		left:   this.place[0] + 'em',
		top:    this.place[1] + 'em'
	});



	//
	// PUBLIC INTERFACE
	//

	this.move = function(place) {
		this.place = place;
		this.$box.css({
			left:   place[0] + 'em',
			top:    place[1] + 'em'
		});
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
			$box.text(this.text || this.name.substring(0, 1));
			$box.css('background-color', this.color);
			$box.css('color', 'white');
		}

		if(this.name) {
			$box.append($('<span class="token-name" />').append($('<span />').text(this.name)));
		}

		this.$box.empty().append($box);
	};
	this.destroy = function() {
		this.$box.remove();
	};
};
