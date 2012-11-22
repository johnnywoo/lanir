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
	var badges = [];
	var hpClass = ''; // to be replaced with name label color



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

	this.toggleBadge = function(name, isEnabled) {
		toggleBadge(name, (arguments.length > 1) ? isEnabled : true);
	};

	this.setHPClass = function(className) {
		hpClass = className;
		t.render();
	};



	//
	// INITIALIZATION
	//

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
			t.$box.append(
				$('<span class="token-name" />')
					.addClass(hpClass)
					.append(
						$('<span />')
							.text(t.name)
					)
			);
		}

		if(t.counter) {
			t.$box.append(
				$('<span class="token-counter" />')
					.append(
						$('<span />')
							.text(t.counter)
					)
			);
		}
	};

	// the box should remain on render, so we can have event handlers on it
	t.$box = $('<div class="token" />');
	t.render();
};

Token.defaultTokenOptions = {};
