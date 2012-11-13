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
	var mapData = t.data.maps[t.data.current_map];

	$.each(t.data.maps, function(k, v) {
		if(!v.name) {
			v.name = k;
		}
	});

	// populating characters
	/** @type {Array.<Character>} */
	var characters = {};
	var addCharacter = function(name, options, kind) {
		characters[name] = new Character({
			name:         name,
			tokenOptions: options
		});
		if(kind == 'pc') {
			characters[name].set('isPC', true);
		}
		if(!t.isReadonlyMode) {
			characters[name].onchange = function(param, value) {
				t.log.pushPostFactum({
					command: 'set',
					name:    name,
					param:   param,
					value:   value
				});
			}
		}
	};
	var forEachChar = function(data, callback) {
		data.pc && $.each(data.pc, function(k, v) { callback(k, v, 'pc'); });
		data.npc && $.each(data.npc, function(k, v) { callback(k, v, 'npc'); });
	};
	forEachChar(t.data, addCharacter);
	forEachChar(mapData, addCharacter);


	// creating the map
	this.map = new Map({
		$container:    t.$mapContainer,
		size:          mapData.size, // hor, ver
		mapImage:      mapData.image,
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
		if(t.data.images[name]) {
			character.tokenOptions.image = t.data.images[name];
		}
		var id = t.map.addToken(new Token(character.tokenOptions));
		character.token = t.map.getToken(id);
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
