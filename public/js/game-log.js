var GameLog = function(options) {
	this.url      = '';
	this.entries  = [];
	this.callback = null; // fires for both push() call and new entries coming from server
	this.loadInterval = 1; // sec
	$.extend(this, options || {});

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	/**
	 * Adds an entry and runs the callback on it
	 */
	this.push = function(entry) {
		push(entry, t.callback);
	};

	/**
	 * Adds an entry without running the callback
	 */
	this.pushPostFactum = function(entry) {
		push(entry);
	};

	/**
	 * Initializes the continious loading of new log entries from the server
	 */
	this.startLoading = function() {
		setInterval(load, t.loadInterval * 1000);
	};



	//
	// INTESTINES
	//

	var load = function() {
		$.ajax({
			type:  'POST',
			url:   t.url,
			data: {
				command: 'get',
				skip:    t.entries.length
			},
			success: function(entries) {
				for(var i = 0; i < entries.length; i++) {
					t.entries.push(entries[i]);
					t.callback && t.callback(entries[i]);
				}
			}
		});
	};

	var push = function(entry, callback) {
		$.ajax({
			type:  'POST',
			url:   t.url,
			async: false, // do not let the entry to be loaded while we're pushing it
			data: {
				command: 'push',
				entry: entry
			},
			success: function() {
				t.entries.push(entry);
				callback && callback(entry);
			}
		});
	};
};
