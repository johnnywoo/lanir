var Token = function(options) {
	// public options
	this.size    = [1, 1]; // cells [hor, ver]
	this.place   = [0, 0]; // coords of left top square of the token
	this.image   = '';
	this.name    = '';
	this.text    = '';
	this.counter = '';
	this.color   = '#004108'; // green
	$.extend(this, options || {});

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.set = function(options) {
		$.extend(t, options);
		t.render();
	};

	this.move = function(place) {
		move(place);
	};

	this.render = function() {
		render();
	};

	this.destroy = function() {
		this.$box.remove();
	};




	//
	// INITIALIZATION
	//

	var move = function(place) {
		t.place = place;
		t.$box.css({
			left:   place[0] + 'em',
			top:    place[1] + 'em'
		});
	};

	var render = function() {
		var $inner;

		t.$box.css({
			width:  t.size[0] + 'em',
			height: t.size[1] + 'em',
			left:   t.place[0] + 'em',
			top:    t.place[1] + 'em'
		});

		if(t.image != '') {
			// image-based token
			$inner = $('<div class="token-image-body" />');
			$inner.css('background', 'url("' + t.image + '") left top no-repeat');
			$inner.css('background-size', '100% 100%');
		} else {
			// text-based token
			$inner = $('<div class="token-text-body" />');
			$inner.text(t.text || t.name.substring(0, 1));
			$inner.css('background-color', t.color);
			$inner.css('color', 'white');
		}

		if(t.name) {
			$inner.append($('<span class="token-name" />').append($('<span />').text(t.name)));
		}

		if(t.counter) {
			$inner.append($('<span class="token-counter" />').append($('<span />').text(t.counter)));
		}

		t.$box.empty().append($inner);
	};

	t.$box = $('<div class="token" />');
	t.render();
};
