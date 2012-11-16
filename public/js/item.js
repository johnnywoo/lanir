var Item = function(options, base) {
	this.params = {
		// all items
		name:     '',
		equipped: false,

		// weapons
		attack: null, // attack type (melee/ranged/spell/holy; null = not a weapon)
		dmg:    new Damage(),

		// armor
		ac: 0,

		base: '' // the topmost base to be used as default name
	};
	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.isWeapon = function() {
		return (this.params.attack != null);
	};

	this.name = function() {
		return this.params.name || ucfirst(this.params.base) || 'Item';
	};

	this.summary = function() {
		var s = '';

		if(t.params.attack != null) {
			s += t.params.dmg.summary() + ' ' + t.params.attack + ' ';
		}

		if(t.params.ac != 0) {
			s += 'AC ' + t.params.ac + ' ';
		}

		return s;
	};

	this.get = function(param) {
		if(typeof t.params[param] == 'undefined') {
			return null;
		}

		return t.params[param];
	};

	this.set = function(param, value) {
		if(typeof t.params[param] == 'undefined') {
			return;
		}

		t.params[param] = value;
	};



	//
	// INITIALIZATION
	//

	var ucfirst = function(s) {
		return s.substring(0, 1).toUpperCase() + s.substring(1);
	};

	var setupProperties = function(options) {
		if(typeof options.base != 'undefined') {
			// first process the base definition
			setupProperties(base[options.base]);
		}

		$.each(options, function(param, value) {
			if(typeof t.params[param] == 'undefined') {
				return;
			}

			var curValue = t.params[param];

			if(curValue instanceof Damage) {
				if(value.charAt(0) == '+') {
					t.params[param].add(value.substring(1));
				} else {
					t.params[param] = new Damage(value);
				}
				return;
			}

			if(typeof curValue == 'number') {
				if(value.match(/^[+-]/)) {
					t.params[param] += parseInt(value);
				} else {
					t.params[param] = parseInt(value);
				}
				return;
			}

			if(typeof curValue == 'boolean') {
				t.params[param] = !!value;
				return;
			}

			t.params[param] = value;
		});
	};
	setupProperties(options);
};
