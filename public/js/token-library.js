var TokenLibrary = function($container) {
	this.$container = $container;
	var t = this;



	//
	// PUBLIC INTERFACE
	//

	/**
	 * @param {string} group
	 * @param {Token} token
	 */
	this.addToken = function(group, token) {
		addToken(group, token);
	};



	//
	// IMPLEMENTATION
	//

	var tokens = [];

	var addToken = function(group, token) {
		tokens.push(token);

		token.set({size: [1,1]});
		token.move([0,0]);
		var $el = $('<div class="token-library-cell" />');
		$el.append(token.$box);

		getGroupContainer(group).append($el);

		// dragging the token from the library onto the map
	};

	var groupContainers = {};
	var getGroupContainer = function(group) {
		if(!groupContainers[group]) {
			groupContainers[group] = $('<div class="token-library-group" />');
			groupContainers[group].append($('<div class="token-library-group-name" />').text(group));
			t.$container.append(groupContainers[group]);
		}
		return groupContainers[group];
	};
};
