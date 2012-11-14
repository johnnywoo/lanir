var Game = function(options) {
	this.data             = {};
	/** @type {GameLog} */
	this.log              = null;
	/** @type {Map} */
	this.map              = null;
	this.isReadonlyMode   = false;
	this.$mapContainer    = null;
	this.$editorContainer = null;
	$.extend(this, options || {});

	var t = this;



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
			tokenOptions: tokenOptions
		});
		$.each(options, characters[name].change);
		if(!t.isReadonlyMode) {
			characters[name].onuichange = function(param, value) {
				t.log.pushPostFactum({
					command: 'set',
					name:    name,
					param:   param,
					value:   value
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

		onselect: function(id, prevId) {
			if(mapIdToName[id]) {
				characters[mapIdToName[id]].$editor.show();
			}

			if(mapIdToName[prevId]) {
				characters[mapIdToName[prevId]].$editor.hide();
			}
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



	//
	// INSTALLING CALLBACKS
	//

	this.log.callback = function(entry) {
		if(!entry.command) {
			throw "Strange log entry: " + entry;
		}

		if(entry.command == 'move') {
			// name place
			var token = characters[entry.name].token;
			if(token) {
				token.move(entry.place);
			}
		}

		if(entry.command == 'set') {
			var character = characters[entry.name];
			if(character) {
				character.set(entry.param, entry.value);
			}
		}
	};

	this.map.onmove = function(tokenId, place) {
		t.log.pushPostFactum({
			command: 'move',
			name: mapIdToName[tokenId],
			place: place.slice(0)
		});
	};



	//
	// GO GO GO!
	//

	this.log.startLoading(); // loads and applies all commands (important to call this AFTER all callbacks were installed)
};
