var Token = function(options) {
	// public options
	this.size    = [1, 1]; // cells [hor, ver]
	this.place   = [0, 0]; // coords of left top square of the token
	this.image   = '';
	this.name    = '';
	this.text    = '';
	this.counter = '';
	this.range   = 3;
	this.color   = '#004108'; // green
	$.extend(this, options || {});

	var t = this;
	var visibleArea = [];
	var badges = [];



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

	this.getVisibleArea = function() {
		if(!visibleArea.length) {
			calculateVisibleArea();
		}
		return visibleArea;
	};

	this.toggleBadge = function(name, isEnabled) {
		toggleBadge(name, (arguments.length > 1) ? isEnabled : true);
	};



	//
	// INITIALIZATION
	//

	var calculateVisibleArea = function() {
		visibleArea = [];
		var w = t.place[0];
		var h = t.place[1];
		for(var x = w - t.range; x <= w + t.range; x++) {
			for(var y = h - t.range; y <= h + t.range; y++) {
				if((Math.pow(w - x, 2) + Math.pow(h - y, 2)) <= Math.pow(t.range, 2)) {
					visibleArea.push(x + '_' + y);
				}
			}
		}
	};

	var toggleBadge = function(name, isEnabled) {
		var pos = $.inArray(name, badges);
		if(isEnabled) {
			if(pos == -1) {
				badges.push(name);
				t.render();
			}
		} else if(pos > -1) {
			badges.splice(pos, 1);
			t.render();
		}
	};

	var move = function(place) {
		t.place = place.slice(0);
		t.$box.css({
			left:   place[0] + 'em',
			top:    place[1] + 'em'
		});
		calculateVisibleArea();
	};

	var setTokenStyle = function($box, options) {
		if(options.image != '') {
			// image-based token
			$box.css('background', 'url("' + options.image + '") left top no-repeat');
			$box.css('background-size', '100% 100%');
		} else {
			// text-based token
			$box.text(options.text || options.name.substring(0, 1));
			$box.css('background-color', options.color);
			$box.css('color', 'white');
		}
	};

	var render = function() {
		var $inner;

		t.$box
			.empty()
			.css({
				width:  t.size[0] + 'em',
				height: t.size[1] + 'em',
				left:   t.place[0] + 'em',
				top:    t.place[1] + 'em'
			});

		$inner = $('<div class="token-body" />');
		setTokenStyle($inner, t);
		t.$box.append($inner);

		var $badges = $('<div class="token-badges" />');
		t.$box.append($badges);
		$.each(badges, function(i, name) {
			var $badge = $('<div class="token-badge" />');
			if(Token.defaultTokenOptions[name]) {
				setTokenStyle($badge, Token.defaultTokenOptions[name] || {name: name});
			}
			$badges.append($badge);
		});

		if(t.name) {
			t.$box.append($('<span class="token-name" />').append($('<span />').text(t.name)));
		}

		if(t.counter) {
			t.$box.append($('<span class="token-counter" />').append($('<span />').text(t.counter)));
		}
	};

	// the box should remain on render, so we can have event handlers on it
	t.$box = $('<div class="token" />');
	t.render();
};

Token.defaultTokenOptions = {};
