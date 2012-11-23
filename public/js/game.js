var Game = function(options) {
	this.data             = {};
	/** @type {GameLog} */
	this.log              = null;
	/** @type {Map} */
	this.map              = null;
	this.isReadonlyMode   = false;
	/** @type {jQuery} */
	this.$mapContainer    = null;
	/** @type {jQuery} */
	this.$editorContainer = null;
	/** @type {jQuery} */
	this.$turnsContainer = null;
	/** @type {jQuery} */
	this.$logContainer    = null;
	$.extend(this, options || {});

	var t = this;
	var isAttackMode = false;


	//
	// PUBLIC INTERFACE
	//

	this.toggleAttackMode = function() {
		// attack mode:
		// 1. show attack counters on everything except selected character
		// 2. if other token is clicked, ask for damage instead of selecting it; then disable the attack mode

		var attackerName = getSelectedCharacterName();
		// no attacker = no attack mode
		if(attackerName ? !isAttackMode : false) {
			enableAttackMode(attackerName);
		} else {
			disableAttackMode();
		}
	};

	this.toggleDamageMode = function() {
		disableAttackMode();

		var name = getSelectedCharacterName();
		if(name) {
			characters[name].focusHurtInp();
		}
	};

	this.drawFog = function() {
		t.log.add({command: 'fog'});
		refreshFog();
		t.map.fog.show();
	};

	this.nextTurn = function() {
		nextTurnUI();
	};



	//
	// IMPLEMENTATION
	//

	var rollD20 = function() {
		return Math.floor(Math.random() * 20) + 1;
	};

	var getSelectedCharacterName = function() {
		return mapIdToName[t.map.selectedTokenId] || null;
	};

	var disableAttackMode = function() {
		isAttackMode = false;
		// disable the attack mode
		$.each(characters, function(name, character) {
			character.displayAttack(); // no char = remove display
		});
	};
	var enableAttackMode = function(attackerName) {
		isAttackMode = true;
		$.each(characters, function(name, character) {
			if(name != attackerName) {
				character.displayAttack(characters[attackerName]);
			}
		});
	};

	var attack = function(attackerName, targetName) {
		var attacker = characters[attackerName];
		var target   = characters[targetName];

		var weapon = attacker.getCurrentWeapon();
		/** @type {Damage} */
		var damage = weapon.get('dmg');

		if(attacker.isPC()) {
			// for PCs we assume they rolled a hit if another token was clicked
			// now we need to:
			// 1. show the target editor
			// 2. focus the damage box with our current weapon damage

			attacker.$editor.hide();
			target.$editor.show();

			setTimeout(function() {
				target.focusHurtInp(damage.summary());
			}, 0);

			// now the DM presses enter in the damage box and we go
			// through character UI code into the onuichange handler below
			return;
		}

		// NPC = full auto attack
		disableAttackMode();
		attacker.set('ready', false);

		var score = attacker.getScoreToHit(target) + 10; // attack = defence -> need to roll 10+ to hit
		var attackRoll = rollD20();

		if(attackRoll < score) {
			// close, but no cigar!
			var entry = {
				command:    'miss',
				attacker:   attackerName,
				target:     targetName,
				roll:       attackRoll,
				isCritical: (attackRoll == 1)
			};
			t.log.add(entry);
			miss(entry);
			return;
		}

		var isCriticalHit = (attackRoll == 20);
		var entry = {
			command:    'hit',
			attacker:   attackerName,
			target:     targetName,
			roll:       attackRoll,
			isCritical: isCriticalHit,
			hit:        isCriticalHit ? damage.max() : damage.roll()
		};
		t.log.add(entry);
		hurt(entry);
	};

	var hurt = function(logEntry) {
		// apply the damage
		var target = characters[logEntry.target];
		target.hurt(logEntry.hit);
		// spend the turn for attacker
		characters[logEntry.attacker].set('ready', false);
	};

	var miss = function(logEntry) {
		// spend the turn for attacker
		characters[logEntry.attacker].set('ready', false);
	};



	//
	// FOG OF WAR
	//

	var visibleArea = [];
	var refreshFog = function() {
		$.each(characters, function(name, character) {
			if(character.isPC()) {
				$.each(character.getVisibleArea(), function(id, coords) {
					if($.inArray(coords, visibleArea) == -1) {
						visibleArea.push(coords);
					}
				});
			}
		});
		t.map.fog.draw(visibleArea);
	};



	//
	// TURNS
	//

	var getCurrentTurnNumber = function() {
		return parseInt($currentTurn.text()) || 0;
	};

	var setCurrentTurnNumber = function(n) {
		return $currentTurn.text(n || '');
	};

	var toggleTurns = function() {
		var turn = getCurrentTurnNumber();
		if(turn) {
			// end of battle
			$nextTurnBtn.attr('disabled', true);
			$toggleTurnsBtn.text('Start turns');
			setCurrentTurnNumber();

			// removing 'ready' from everyone
			$.each(characters, function(name, character) {
				character.set('ready', false);
			});
		} else {
			// start of battle
			$nextTurnBtn.attr('disabled', false);
			$toggleTurnsBtn.text('End turns');
			nextTurn();
		}

		return !turn;
	};

	var nextTurn = function() {
		setCurrentTurnNumber(getCurrentTurnNumber() + 1);

		// everyone is ready (except inactive characters)
		$.each(characters, function(name, character) {
			if(character.isActive()) {
				character.set('ready', true);
			}
		});
	};

	var nextTurnUI = function() {
		if(getCurrentTurnNumber()) {
			nextTurn();
			t.log.add({command: 'turn'});
		}
	};



	//
	// INITIALIZATION
	//

	// config mangling
	if(!t.data.current_map) {
		t.data.current_map = Object.keys(t.data.maps)[0];
	}
	if(!t.data.maps[t.data.current_map]) {
		alert('No map!');
		throw 'Bleeeegh';
	}
	$.each(t.data.maps, function(k, v) {
		if(!v.name) {
			v.name = k;
		}
	});

	// config is the global data extended with current map data
	var config = {};
	$.extend(true, config, t.data, t.data.maps[t.data.current_map]);

	Token.defaultTokenOptions = config.tokens;

	// populating characters
	/** @type {Object.<string, Character>} */
	var characters = {};
	var addCharacter = function(name, options, kind) {
		// default char options
		var fullName = options.name || name;
		delete options.name;
		if(kind == 'pc') {
			options.isPC = true;
		}

		// token options
		var tokenOptions = config.tokens[name] || {};
		tokenOptions.name = tokenOptions.name || fullName;

		// char init
		characters[name] = new Character({
			name:         fullName,
			tokenOptions: tokenOptions,
			baseItems:    config.base || {},
			onchange: function() {
				if(isAttackMode) {
					enableAttackMode(getSelectedCharacterName());
				}
			}
		});
		$.each(options, characters[name].change); // items are skipped by this
		$.each(options.items || [], function(i, item) {
			characters[name].addItem(item);
		});
		if(!t.isReadonlyMode) {
			characters[name].onuichange = function(param, value, oldValue) {
				if(param == 'hp' && isAttackMode) {
					// damage done while in attack mode should be recorded differently
					var attackerName = getSelectedCharacterName();
					t.log.add({
						command:    'hit',
						attacker:   attackerName,
						target:     name,
						roll:       10,    // unknown
						isCritical: false, // unknown
						hit:        oldValue - value
					});

					// hide the target editor back
					characters[name].$editor.hide();
					characters[attackerName].$editor.show();

					disableAttackMode();
					characters[attackerName].set('ready', false);
					return;
				}

				if(param == 'ready' && isAttackMode) {
					// not ready while in attack mode = miss
					t.log.add({
						command:    'miss',
						attacker:   name,
						target:     name, // unknown
						roll:       10,   // unknown
						isCritical: false // unknown
					});

					disableAttackMode();
					characters[name].set('ready', false);
					return;
				}

				t.log.add({
					command:  'set',
					name:     name,
					param:    param,
					value:    value,
					oldValue: oldValue
				});
			}
		}
	};
	config.pc  && $.each(config.pc,  function(k, v) { addCharacter(k, v, 'pc');  });
	config.npc && $.each(config.npc, function(k, v) { addCharacter(k, v, 'npc'); });


	// creating the map
	this.map = new Map({
		$container:    t.$mapContainer,
		size:          config.size, // hor, ver
		mapImage:      config.image,
		movableTokens: !t.isReadonlyMode,

		onbeforeselect: function(id, prevId) {
			if(isAttackMode) {
				// inflict tons of damage
				if(mapIdToName[id] && mapIdToName[prevId]) {
					attack(mapIdToName[prevId], mapIdToName[id]);
				}
				return false; // cancel dragging/selecting
			}

			if(mapIdToName[id]) {
				characters[mapIdToName[id]].$editor.show();
			}

			if(id != prevId && mapIdToName[prevId]) {
				characters[mapIdToName[prevId]].$editor.hide();
			}

			return null;
		}
	});

	// filling the UI with character tokens and editors
	var mapIdToName = {};
	$.each(characters, function(name, character) {
		// map token
		var id = t.map.addToken(character.createToken());
		mapIdToName[id] = name;

		// editor
		t.$editorContainer.append(character.$editor);
		character.$editor.hide();
	});

	// turn buttons
	var $toggleTurnsBtn = $('<button class="turns-toggle">Start turns</button>');
	var $currentTurn    = $('<span class="current-turn" />');
	var $nextTurnBtn    = $('<button class="turns-next" disabled="disabled">Next turn</button>');
	if(t.$turnsContainer) {
		t.$turnsContainer
			.append($toggleTurnsBtn)
			.append($currentTurn)
			.append($nextTurnBtn);
	}

	$toggleTurnsBtn.click(function() {
		var enabled = toggleTurns();
		t.log.add({
			command: 'toggle-turns',
			enabled: enabled
		});
	});
	$nextTurnBtn.click(nextTurnUI);


	//
	// INSTALLING CALLBACKS
	//

	// reacting on changes from the server
	this.log.onfetch = function(entry) {
		if(!entry.command) {
			throw "Strange log entry: " + entry;
		}

		switch(entry.command) {
			case 'move':
				// name place
				var token = characters[entry.name].token;
				if(token) {
					token.move(entry.place);
				}
				break;

			case 'set':
				var character = characters[entry.name];
				if(character) {
					character.set(entry.param, entry.value);
				}
				break;

			case 'hit':
				hurt(entry);
				break;

			case 'miss':
				miss(entry);
				break;

			case 'fog':
				refreshFog();
				break;

			case 'toggle-turns':
				toggleTurns();
				break;

			case 'turn':
				nextTurn();
				break;
		}
	};

	// displaying the battle log
	this.log.onadd = function(entry) {
		if(!t.$logContainer) {
			return;
		}

		var addText = function(text, className) {
			t.$logContainer.append($('<div />').addClass(className || '').text(text));
			// scroll to the bottom
			t.$logContainer.scrollTop(t.$logContainer.get(0).scrollHeight);
		};

		switch(entry.command) {
			case 'move':
				var character = characters[entry.name];
				if(character) {
					var distance = '';
					if(entry.distance) {
						distance = entry.distance + ' step' + (entry.distance > 1 ? 's' : '');
					}
					addText(character.name + ' moves ' + distance, 'log-entry-move');
				}
				break;

			case 'set':
				var character = characters[entry.name];
				if(!character) {
					break;
				}

				// equipping/removing an item
				var m = entry.param.match(/^item__(\d+)__equipped$/);
				if(m) {
					var item = character.items[m[1]];
					if(item) {
						var desc;
						if(item.isWeapon()) {
							desc = (entry.value ? ' now wields ' : ' puts away ');
						} else {
							desc = (entry.value ? ' equips ' : ' takes off ');
						}
						addText(character.name + desc + item.name());
					}
					break;
				}

				// general boolean params
				if(typeof entry.value == 'boolean') {
					addText(character.name + (entry.value ? ' is ' : ' now is not ') + entry.param);
					break;
				}

				// damage/heal
				if(entry.param == 'hp') {
					var diff = entry.value - entry.oldValue;
					if(diff > 0) {
						addText(character.name + ' heals ' + diff + ' HP', 'log-entry-heal');
					}
					if(diff < 0) {
						addText(character.name + ' receives ' + (-diff) + ' damage', 'log-entry-damage');
					}
					break;
				}

				break;

			case 'hit':
				var attacker = characters[entry.attacker];
				var target   = characters[entry.target];
				if(attacker && target) {
					addText(attacker.name + (entry.isCritical ? ' critically' : '') + ' hits ' + target.name + ' for ' + entry.hit + ' damage', 'log-entry-hit');
				}
				break;

			case 'miss':
				var attacker = characters[entry.attacker];
				var target   = characters[entry.target];
				if(attacker && target) {
					addText(attacker.name + (entry.isCritical ? ' critically' : '') + ' misses ' + (entry.attacker == entry.target ? '' : target.name), 'log-entry-miss');
				}
				break;

			case 'fog':
				addText('Fog of war was refreshed', 'log-entry-fog-of-war');
				break;

			case 'toggle-turns':
				addText(entry.enabled ? 'Turn-based all up in here!' : 'Huzzah! We did it!', 'log-entry-toggle-turns');
				if(entry.enabled) {
					addText('Turn 1', 'log-entry-turn');
				}
				break;

			case 'turn':
				addText('Turn ' + getCurrentTurnNumber(), 'log-entry-turn');
				break;
		}
	};

	this.map.onmove = function(tokenId, place, fromPlace, distance) {
		if(place[0] != fromPlace[0] || place[1] != fromPlace[1]) {
			t.log.add({
				command:  'move',
				name:     mapIdToName[tokenId],
				place:    place.slice(0),
				distance: distance
			});
		}
	};



	//
	// GO GO GO!
	//

	this.log.startLoading(); // loads and applies all commands (important to call this AFTER all callbacks were installed)
};
