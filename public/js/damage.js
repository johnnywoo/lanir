var Damage = function(damage) {
	this.dice = []; // list of [num, die]; e.g. [[1, 6]] for 1d6
	this.num  = 0; // e.g. 2 for 1d6+2

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	this.add = function(damage) {
		var m = damage.match(/^(?:(\d+)d(\d+))?(?:\+(\d+))?$/);
		if(m[1]) {
			addDie([parseInt(m[1]), parseInt(m[2])]);
		}
		if(m[3]) {
			t.num += parseInt(m[3]);
		}
	};

	this.summary = function() {
		var s = [];
		for(var i = 0; i < t.dice.length; i++) {
			if(t.dice[i][0] != 0) {
				s.push(t.dice[i][0] + 'd' + t.dice[i][1]);
			}
		}
		if(t.num) {
			s.push(t.num)
		}
		return s.length ? s.join('+') : '0';
	};



	//
	// INITIALIZATION
	//

	var addDie = function(die) {
		for(var i = 0; i < t.dice.length; i++) {
			if(t.dice[i][1] == die[1]) {
				t.dice[i][0] += die[0];
				return;
			}
		}
		t.dice.push(die);
	};

	if(damage) {
		this.add(damage);
	}
};
