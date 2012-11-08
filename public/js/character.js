var Character = function(options) {
	this.name = '';
	/** @type {Token} */
	this.token = null;
	this.tokenOptions = {};
	this.params = {
		str: 10,
		dex: 10,
		con: 10,
		int: 10,
		wis: 10,
		cha: 10,

		// hp, max-hp

		dead: false,
		unconscious: false,

		inactive: false,
		ready: true
	};
	$.extend(this, options || {});

	var t = this;

	this.$editor = $('<div class="character-editor" />');

	this.render = function() {
		t.$editor.empty();

		// editor title
		t.$editor.append($('<form class="character-name" />').text(t.name));

		// params
		$.each(t.params, function(param, value) {
			var $block = $('<div />');

			switch(typeof value) {
				case 'boolean':
					$block.append(
						$('<label />')
							.append($('<input type="checkbox" />').attr({name: param, checked: value}))
							.append($('<span />').text(' ' + param))
					);
					break;
				case 'number':
					$block
						.append($('<span class="prefix" />').text(param + ' '))
						.append($('<input type="text" class="number" />').attr({name: param, value: value}));
					break;
				default: // text
					$block.text('Lolwut? '+param);
			}

			t.$editor.append($block);
		});
	};

	this.render();
};
