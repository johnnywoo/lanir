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
	this.onchange     = null; // function(param, value, oldValue); is called on any change in params (including items)
	this.params = {
		str: 10,
		dex: 10,
		con: 10,
		int: 10,
		wis: 10,
		cha: 10,

		hp:    30,
		maxHP: 30,

		// this weapon will be used if no weapon item is equipped
		naturalWeapon: new Item({attack: 'melee', dmg: '1d4'}),

		dead:        false,
		unconscious: false,

		inactive: false,
		ready:    true,
		isPC:     false,

		visionRange: 3
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

	this.addItem = function(options) {
		addItem(options);
	};

	/**
	 * @return {Item}
	 */
	this.getCurrentWeapon = function() {
		return getEquippedWeapon() || t.params.naturalWeapon;
	};

	this.getScore = function(name) {
		return getScore(name);
	};

	/**
	 * @param {Character} target
	 */
	this.getScoreToHit = function(target) {
		return getScoreToHit(target);
	};

	this.hurt = function(hit) {
		hurt(hit);
	};

	this.getVisibleArea = function() {
		return calculateVisibleArea();
	};

	this.isPC = function() {
		return t.params.isPC;
	};

	/**
	 * @param {Character} attacker
	 */
	this.displayAttack = function(attacker) {
		displayAttack(attacker);
	};

	this.createToken = function() {
		return createToken();
	};

	this.focusHurtInp = function(value) {
		if(arguments.length) {
			$hurtInp.val(value);
		}
		$hurtInp.focus().get(0).select();
	};



	//
	// GAME MECHANICS
	//

	var getScoreToHit = function(target) {
		var weapon = t.getCurrentWeapon();
		var attackMode = weapon.resolveAttackMode(); // [score-attack score-defence]

		// score to hit is defence minus attack (good attack = lower score; attack = defence -> score 0)
		return target.getScore(attackMode[1]) - t.getScore(attackMode[0]);
	};

	var getScore = function(name) {
		var score = 0;

		// scores are made from other scores
		switch(name) {
			case 'ac':
				score += getScore('dex');
				break;

			case 'fortitude':
				score += Math.max(getScore('str'), getScore('con'));
				break;

			case 'reflex':
				score += Math.max(getScore('dex'), getScore('int'));
				break;

			case 'will':
				score += Math.max(getScore('wis'), getScore('cha'));
				break;

			case 'perception':
				score += getScore('wis');
				break;

			case 'memory':
				score += getScore('wis');
				break;

			case 'religion':
				score += getScore('wis');
				break;

			case 'arcana':
				score += getScore('int');
				break;

			case 'diplomacy':
				score += getScore('cha');
				break;

			case 'thievery':
				score += getScore('dex');
				break;

			default:
				if(typeof t.params[name] == 'number') {
					score += t.params[name];
				}
		}

		// equipped items can add bonuses (e.g. armor adds AC)
		$.each(t.items, function(id, item) {
			if(!item.get('equipped')) {
				return;
			}
			var bonus = item.get(name);
			if(bonus != null) {
				score += parseInt(bonus);
			}
		});

		return score;
	};

	var internalParamChange = function(param, newValue, oldValue) {
		// the callback happens after the change, so it's ok to assume new value everywhere

		switch(param) {
			case 'con':
				var change = 2 * (newValue - oldValue);
				change = (change > 0) ? '+' + change : change.toString(); // either '+1' or '-1'
				t.change('maxHP', change);
				t.change('hp', change);
				break;

			case 'hp':
				syncHPDisplay();

				// unconscious/dead
				var newHP = t.getScore('hp');
				if(newHP <= 0) {
					// the bastard died (PCs don't usually die, though)
					if(!t.params.unconscious && !t.params.dead) {
						t.change(t.params.isPC ? 'unconscious' : 'dead', true);
					}
				} else {
					// the bastard was resurrected?!
					t.change('unconscious', false);
					t.change('dead', false);
				}
				break;

			case 'maxHP':
				syncHPDisplay();
				break;
		}
	};

	var hurt = function(hit) {
		if(t.params.dead) {
			return;
		}

		var hpChange = -hit;
		t.change('hp', (hpChange < 0) ? hpChange.toString() : '+' + hpChange);
	};

	var calculateVisibleArea = function() {
		var visibleArea = [];
		if(t.token) {
			var w = t.token.place[0];
			var h = t.token.place[1];
			var range = t.getScore('visionRange');
			// basically vision range is a square with radius of visionRange around our token
			for(var x = w - range; x <= w + range; x++) {
				for(var y = h - range; y <= h + range; y++) {
					visibleArea.push(x + '_' + y);
				}
			}
		}
		return visibleArea;
	};



	//
	// PARAM MANAGEMENT
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

			// universal change callback (so the game can react on param changes)
			t.onchange && t.onchange(param, newValue, oldValue);

			// internal callback for interdependent params (we really need to use proper events here)
			internalParamChange(param, newValue, oldValue);
		}
	};

	var addItem = function(options) {
		var item = new Item(options, t.baseItems);

		// items are autoequipped unless it's a weapon and we have one already equipped
		if(!item.isWeapon() || !getEquippedWeapon()) {
			item.set('equipped', true);
		}

		var id = t.items.push(item) - 1;
		addItemEditor(id, item);

	};



	//
	// USER INTERFACE
	//

	var displayAttack = function(attacker) {
		if(!attacker) {
			// remove the attack display
			if(t.token) {
				t.token.set({counter: ''});
			}
			return;
		}

		// display the attack counter
		if(t.token) {
			t.token.set({counter: attacker.getScoreToHit(t) + 10}); // if score is 0, you need to roll 10+ to hit
		}
	};

	var createToken = function() {
		t.token = new Token(t.tokenOptions);
		// init badges
		$.each(t.paramsWithBadges, function(i, param) {
			if(t.params[param]) {
				t.token.toggleBadge(param, t.params[param]);
			}
		});
		syncHPDisplay();
		return t.token;
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

	var syncHPDisplay = function() {
		var hp    = t.getScore('hp');
		var maxHP = t.getScore('maxHP');

		var percents = Math.min(100 * hp / maxHP, 100);

		// updating the editor display
		$hpBox.find('.text').text(hp + ' / ' + maxHP);
		$hpBox.find('.ruler').css('width', percents + '%');

		var hpClass = '';
		if(percents > 99)      hpClass = 'hp-max';
		else if(percents > 50) hpClass = 'hp-high';
		else if(percents > 20) hpClass = 'hp-medium';
		else if(percents > 0)  hpClass = 'hp-low';
		else                   hpClass = 'hp-awful';
		$hpBox.removeClass('hp-max hp-high hp-medium hp-low hp-awful').addClass(hpClass);

		// updating the token
		if(t.token) {
			t.token.setHPClass(hpClass);
		}
	};

	var hurtInpEnter = function() {
		// manual damage input
		var value = $hurtInp.val();
		var hit;
		if(value.match(/^-?\d+$/)) {
			hit = parseInt(value);
		} else {
			var damage = new Damage(value);
			hit = damage.roll();
		}

		var hpChange = -hit;
		var change = (hpChange < 0) ? hpChange.toString() : '+' + hpChange;
		changeParam('hp', change, t.onuichange);
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

	// param inputs
	var alreadyDrawn = ['naturalWeapon', 'visionRange'];

	// custom inputs: stats
	alreadyDrawn.push('str', 'dex', 'con', 'int', 'wis', 'cha');
	t.$editor.append(
		'<div class="show-character-stats-link"><a href="" class="js-link" onclick="$(\'body\').addClass(\'show-character-stats\'); return false">Show stats<br /></a></div>'
		+ '<div class="stats-3column editor-character-stats">'
			+ '<div><a href="" class="js-link" onclick="$(\'body\').removeClass(\'show-character-stats\'); return false">Hide stats</a></div>'
			// fortitude, reflex, will
			+ '<label><span>STR</span> <input type="text" name="str" /></label>'
			+ '<label><span>DEX</span> <input type="text" name="dex" /></label>'
			+ '<label><span>WIS</span> <input type="text" name="wis" /></label>'
			+ '<label><span>CON</span> <input type="text" name="con" /></label>'
			+ '<label><span>INT</span> <input type="text" name="int" /></label>'
			+ '<label><span>CHA</span> <input type="text" name="cha" /></label>'
		+ '</div>'
	);

	// custom inputs: hp
	alreadyDrawn.push('hp', 'maxHP');
	var $hpBox = $('<div class="editor-hp"><span class="ruler" /><span class="text" /></div>');
	t.$editor.append($hpBox);
	syncHPDisplay();

	// damage controls
	var $hurtInp = $('<input type="text" class="number" name="hurt" />');
	$hurtInp
		.keyup(function(e) {
			if(e.which == 13) { // enter
				e.stopPropagation();
				hurtInpEnter();
				e.target.select();
			}

			if(e.which == 27) { // esc
				// lose the focus so global keyboard shortcuts work again
				e.target.blur();
			}
		})
		.change(function(e) {
			e.stopPropagation();
		});
	t.$editor.append(
		$('<div class="editor-damage">Damage: </div>')
			.append($hurtInp)
	);

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
