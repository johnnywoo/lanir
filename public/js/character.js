var Character = function(options) {
	this.name         = '';
	/** @type {Token} */
	this.token        = null;
	this.tokenOptions = {};
	/** @type {jQuery} */
	this.$editor      = null;
	/** @type {function} */
	this.onchange     = null; // function(param, value)
	this.params = {
		str: 10,
		dex: 10,
		con: 10,
		int: 10,
		wis: 10,
		cha: 10,

		// hp, max-hp

		dead: false,
		unconscious: false,

		inactive: false,
		ready: true,
		isPC: false
	};

	$.extend(this, options || {});

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.render = function() {
		t.$editor.empty();

		// editor title
		t.$editor.append($('<form class="character-name" />').text(t.name));

		// params
		$.each(t.params, function(param, value) {
			var $block = $('<div />');

			switch(typeof value) {
				case 'boolean':
					$block.append(
						$('<label />')
							.append($('<input type="checkbox" />').attr({name: param, checked: value}))
							.append($('<span />').text(' ' + param))
					);
					break;
				case 'number':
					$block
						.append($('<span class="prefix" />').text(param + ' '))
						.append($('<input type="text" class="number" />').attr({name: param, value: value}));
					break;
				default: // text
					$block.text('Lolwut? '+param);
			}

			t.$editor.append($block);
		});
	};

	this.change = function(param, change, noCallback) {
		var newValue = null;
		if(typeof t.params[param] == 'boolean') {
			newValue = !!change;
		} else {
			// numeric change can be reset, plus and minus
			var m;
			if(change.match(/^\++$/)) {
				// ++ = add 2
				change = change.length;
			} else if(change.match(/^-+$/)) {
				// -- = subtract 2
				change = -change.length;
			} else if(change.match(/^[+-][0-9]+$/)) {
				// +3 = add 3
				// @todo here we should be able to do +1d6 and auto-roll (with the roll appearing in some form of log/window)
				change = parseInt(change);
			} else {
				// 3 = set to 3
				change = parseInt(change) - t.params[param];
			}

			newValue = t.params[param] + change;
		}

		if(t.params[param] != newValue) {
			t.params[param] = newValue;
			setInputValue(param, newValue);
			t.onchange && !noCallback && t.onchange(param, newValue);
		}

		return newValue;
	};



	//
	// INITIALIZATION
	//

	var setInputValue = function(param, value) {
		var $inp = t.$editor.find('[name='+param+']');
		if(typeof value == 'boolean') {
			$inp.attr('checked', value);
		} else {
			$inp.val(value);
		}
	};

	this.$editor = $('<div class="character-editor" />');

	var applyChanges = function(inp) {
		var $inp = $(inp);
		var param = $inp.attr('name');
		if(typeof t.params[param] != 'undefined') {
			t.change(param, $inp.val());
		}
	};

	this.$editor
		.keyup(function(e) {
			if(e.target.nodeName == 'INPUT' && e.which == 13) {
				applyChanges(e.target);
				e.target.select();
			}
		})
		.change(function(e) {
			applyChanges(e.target);
		});

	this.render();
};
