var Game = function(options) {
	this.data = {};
	/** @type {GameLog} */
	this.log  = null;
	/** @type {Map} */
	this.map  = null;
	$.extend(this, options || {});

	var t = this;



	//
	// INSTALLING CALLBACKS
	//

	this.log.callback = function(entry) {
		if(!entry.command) {
			throw "Strange log entry: " + entry;
		}

		if(entry.command == 'move') {
			// id place
			var token = t.map.getToken(entry.id);
			if(token) {
				token.move(entry.place);
			}
		}
	};

	this.map.onmove = function(tokenId, place) {
		t.log.pushPostFactum({
			command: 'move',
			id: tokenId,
			place: place.slice(0)
		});
	};



	//
	// INITIALIZATION
	//

	this.log.startLoading(); // loads and applies all commands (important to call this AFTER all callbacks were installed)
};
