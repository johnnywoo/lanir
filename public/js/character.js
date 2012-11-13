var Character = function(options) {
	this.name         = '';
	/** @type {Token} */
	this.token        = null;
	this.tokenOptions = {};
	/** @type {jQuery} */
	this.$editor      = null;
	/** @type {function} */
	this.onchange     = null; // function(param, value, oldValue); is called when the change comes from UI (.set()/.change() do not call it)
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

	/**
	 * Sets a new value for a character param
	 *
	 * @param {string} param
	 * @param value
	 */
	this.set = function(param, value) {
		if(typeof value != 'boolean') {
			value = '=' + value; // this way negative numbers don't count as changes
		}
		changeParam(param, value);
	};

	/**
	 * Modifies a param value
	 *
	 * Change can be:
	 * '+', '++', '-', '--' for increment/decrement
	 * '+1', '-5' for arithmetic modification
	 * '5', '=-1' for resetting
	 *
	 * @param {string} param
	 * @param change
	 */
	this.change = function(param, change) {
		changeParam(param, change);
	};



	//
	// IMPLEMENTATION
	//

	var changeParam = function(param, change, callback) {
		if(typeof t.params[param] == 'undefined') {
			return;
		}

		var newValue = null;
		var oldValue = t.params[param];
		if(typeof oldValue == 'boolean') {
			newValue = !!change;
		} else {
			// numeric change can be reset, plus and minus
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
			} else if(change.match(/^=/)) {
				// =3 = set to 3
				change = parseInt(change.substring(1)) - oldValue;
			} else {
				// 3 = set to 3
				change = parseInt(change) - oldValue;
			}

			newValue = oldValue + change;
		}

		if(oldValue != newValue) {
			t.params[param] = newValue;
			setInputValue(param, newValue);
			callback && callback(param, newValue, oldValue);
		}
	};

	var setInputValue = function(param, value) {
		var $inp = t.$editor.find('[name='+param+']');
		if(typeof value == 'boolean') {
			$inp.attr('checked', value);
		} else {
			$inp.val(value);
		}
	};

	var applyChanges = function(inp) {
		var $inp = $(inp);
		changeParam($inp.attr('name'), $inp.val(), t.onchange);
	};



	//
	// INITIALIZATION
	//

	t.$editor = $('<div class="character-editor" />');

	t.$editor
		.keyup(function(e) {
			if(e.target.nodeName == 'INPUT' && e.which == 13) {
				applyChanges(e.target);
				e.target.select();
			}
		})
		.change(function(e) {
			applyChanges(e.target);
		});

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
