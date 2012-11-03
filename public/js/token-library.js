var TokenLibrary = function($container) {
	this.$container = $container;
	var t = this;



	//
	// PUBLIC INTERFACE
	//

	/**
	 * @param {Token} token
	 */
	this.addToken = function(token) {
		addToken(token);
	};



	//
	// IMPLEMENTATION
	//

	var tokens = [];

	var addToken = function(token) {
		tokens.push(token);

		token.set({size: [1,1]});
		token.move([0,0]);
		var $el = $('<div class="token-library-cell" />');
		$el.append(token.$box);

		t.$container.append($el);

		// dragging the token from the library onto the map
	};
};
