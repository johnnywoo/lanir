var Character = function(options) {
	this.name         = '';
	/** @type {Token} */
	this.token        = null;
	this.tokenOptions = {};
	this.baseItems    = {};
	/** @type {jQuery} */
	this.$editor      = null;
	/** @type {function} */
	this.onuichange   = null; // function(param, value, oldValue); is called when the change comes from UI (.set()/.change() do not call it)
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
	this.paramsWithBadges = ['dead', 'unconscious'];
	/** @type {Array.<Item>} */
	this.items = [];

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

	this.createToken = function() {
		t.token = new Token(t.tokenOptions);
		// init badges
		$.each(t.paramsWithBadges, function(i, param) {
			if(t.params[param]) {
				t.token.toggleBadge(param, t.params[param]);
			}
		});
		return t.token;
	};

	this.addItem = function(options) {
		var item = new Item(options, t.baseItems);

		// items are autoequipped unless it's a weapon and we have one already equipped
		if(!item.isWeapon() || !getEquippedWeapon()) {
			item.set('equipped', true);
		}

		var id = t.items.push(item) - 1;
		addItemEditor(id, item);
	};



	//
	// IMPLEMENTATION
	//

	var getEquippedWeapon = function() {
		for(var i = 0; i < t.items.length; i++) {
			var item = t.items[i];
			if(item.isWeapon() && item.get('equipped')) {
				return item;
			}
		}
		return null;
	};

	var changeValue = function(oldValue, change) {
		if(typeof oldValue == 'boolean') {
			return !!change;
		}

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

		return oldValue + change;
	};

	var setItemParam = function(id, param, value) {
		var item = t.items[id];
		item.set(param, value);
		if(param == 'equipped' && value && item.isWeapon()) {
			// unequip other weapons
			for(var i = 0; i < t.items.length; i++) {
				if(i != id && t.items[i].isWeapon()) {
					changeParam('item__' + i + '__' + param, false);
				}
			}
		}
	};

	var changeParam = function(param, change, callback) {
		var oldValue = null;
		var set = null;
		if(typeof t.params[param] != 'undefined') {
			// char param
			oldValue = t.params[param];
			set = function(x) {t.params[param] = x};
		} else if(param.match(/^item__/)) {
			// item param
			var m = param.match(/^item__(\d+)__(.*)$/);
			if(t.items[m[1]]) {
				oldValue = t.items[m[1]].get(m[2]);
				set = function(x) {setItemParam(m[1], m[2], x)};
			}
		} else {
			return;
		}

		var newValue = changeValue(oldValue, change);

		if(oldValue != newValue) {
			set(newValue);
			setInputValue(param, newValue);

			// possible onuichange call
			callback && callback(param, newValue, oldValue);

			// updating the token
			if(t.token && $.inArray(param, t.paramsWithBadges) > -1) {
				t.token.toggleBadge(param, newValue);
			}
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
		changeParam($inp.attr('name'), $inp.is(':checkbox') ? $inp.attr('checked') : $inp.val(), t.onuichange);
	};



	//
	// INITIALIZATION
	//

	t.$editor = $('<div class="character-editor" />');

	t.$editor
		.bind('focus click', function(e) {
			if(e.target.nodeName == 'INPUT') {
				e.target.select();
			}
		})
		.keyup(function(e) {
			if(e.target.nodeName == 'INPUT' && e.which == 13) {
				applyChanges(e.target);
				e.target.select();
			}
		})
		.change(function(e) {
			applyChanges(e.target);
		});

	// editor title
	t.$editor.append($('<form class="character-name" />').text(t.name));

	//
	// PARAM INPUTS
	//

	var alreadyDrawn = [];

	// custom inputs
	if(typeof t.params.str != 'undefined') {
		alreadyDrawn.push('str', 'dex', 'con', 'int', 'wis', 'cha');

		t.$editor.append($('<div class="stats-3column" />').html(
			// fortitude, reflex, will
			'<label><span>STR</span> <input type="text" name="str" /></label>'
			+ '<label><span>DEX</span> <input type="text" name="dex" /></label>'
			+ '<label><span>WIS</span> <input type="text" name="wis" /></label>'
			+ '<label><span>CON</span> <input type="text" name="con" /></label>'
			+ '<label><span>INT</span> <input type="text" name="int" /></label>'
			+ '<label><span>CHA</span> <input type="text" name="cha" /></label>'
		));
	}
	// generic inputs
	$.each(t.params, function(param, value) {
		if($.inArray(param, alreadyDrawn) > -1) {
			return;
		}

		var $block = $('<div />');

		switch(typeof value) {
			case 'boolean':
				$block.append(
					$('<label />')
						.append($('<input type="checkbox" />').attr('name', param))
						.append($('<span />').text(' ' + param))
				);
				break;
			case 'number':
				$block
					.append($('<span class="prefix" />').text(param + ' '))
					.append($('<input type="text" class="number" />').attr('name', param));
				break;
			default: // text
				$block.text('Lolwut? '+param);
		}

		t.$editor.append($block);
	});

	var $itemsBox = $('<div class="character-items" />');
	t.$editor.append($itemsBox);
	var addItemEditor = function(id, item) {
		// creating the box (no flexible parameters for now)
		var inputName = 'item__' + id + '__equipped';
		$itemsBox.append(
			$('<div class="item-editor" />')
				.toggleClass('item-is-weapon', item.isWeapon())
				.append($('<span class="item-name" />').text(item.name()))
				.append(' ')
				.append($('<span class="item-summary" />').text(item.summary()))
				.append($('<div />').append(
					$('<label />')
						.append($('<input type="checkbox" />').attr('name', inputName))
						.append(' equipped')
				))
		);
		// setting input values
		setInputValue(inputName, item.get('equipped'));
	};

	// installing param values
	$.each(t.params, setInputValue);
};
