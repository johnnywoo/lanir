var GameLog = function(options) {
	this.url          = '';
	this.entries      = [];
	this.onfetch      = null; // function(entry); fires for new entries coming from server
	this.onadd        = null; // function(entry); fires for any added events, both fetched from server and added locally
	this.loadInterval = 1; // sec
	$.extend(this, options || {});

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.add = function(entry) {
		push(entry);
	};

	/**
	 * Initializes the continious loading of new log entries from the server
	 */
	this.startLoading = function() {
		load();
		if(!window.onlyLoadOnce)
			setInterval(load, t.loadInterval * 1000);
	};



	//
	// INTESTINES
	//

	var add = function(entry) {
		t.entries.push(entry);
		t.onadd && t.onadd(entry);
	};

	var load = function() {
		$.ajax({
			type: 'POST',
			url:  t.url,
			data: {
				command: 'get',
				skip:    t.entries.length
			},
			success: function(entries) {
				for(var i = 0; i < entries.length; i++) {
					add(entries[i]);
					t.onfetch && t.onfetch(entries[i]);
				}
			}
		});
	};

	var push = function(entry) {
		$.ajax({
			type:  'POST',
			url:   t.url,
			async: false, // do not let the entry to be loaded while we're pushing it
			data: {
				command: 'push',
				entry: JSON.stringify(entry)
			},
			success: function() {
				add(entry);
			}
		});
	};
};
