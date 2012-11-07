var Game = function(options) {
	this.data = {};
	/** @type {GameLog} */
	this.log  = null;
	/** @type {Map} */
	this.map  = null;
	this.isReadonlyMode = false;
	this.$mapContainer = null;
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

	// creating the map
	this.map = new Map({
		$container:    t.$mapContainer,
		size:          mapData.size, // hor, ver
		mapImage:      mapData.image,
		movableTokens: !t.isReadonlyMode
	});

	// filling the map with tokens
	var charTokens  = {};
	var mapIdToName = {};
	var addMapToken = function(name, options) {
		var tokenOptions = $.extend({}, options); // shallow copy
		if(t.data.images[name]) {
			tokenOptions.image = t.data.images[name];
		}
		var id = t.map.addToken(new Token(tokenOptions));
		charTokens[name] = t.map.getToken(id);
		mapIdToName[id]  = name;
	};
	var forEachChar = function(data, callback) {
		data.pc && $.each(data.pc, function(k, v) { callback(k, v, 'pc'); });
		data.npc && $.each(data.npc, function(k, v) { callback(k, v, 'npc'); });
	};
	forEachChar(t.data, addMapToken);
	forEachChar(mapData, addMapToken);



	//
	// INSTALLING CALLBACKS
	//

	this.log.callback = function(entry) {
		if(!entry.command) {
			throw "Strange log entry: " + entry;
		}

		if(entry.command == 'move') {
			// name place
			var token = charTokens[entry.name];
			if(token) {
				token.move(entry.place);
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
