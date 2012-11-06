var GameLog = function(options) {
	this.url      = '';
	this.entries  = [];
	this.callback = null; // fires for both push() call and new entries coming from server
	$.extend(this, options || {});

	var t = this;

	this.push = function(entry) {
		push(entry, t.callback);
	};

	/**
	 * Adds an entry without running the callback
	 */
	this.pushPostFactum = function(entry) {
		push(entry);
	};

	this.load = function(entries) {
		for(var i = 0; i < entries.length; i++) {
			t.entries.push(entries[i]);
			t.callback && t.callback(entries[i]);
		}
	};

	var push = function(entry, callback) {
		$.ajax({
			type: 'POST',
			url:  t.url,
			data: {
				command: 'push',
				entry: entry
			},
			success: function() {
				t.entries.push(entry);
				callback && callback(entry);
			},
			error: function() {
				alert('BLEEEEH!');
			}
		});
	};
};
