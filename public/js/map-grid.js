var MapGrid = function(w, h) {
	if(w < 1 || h < 1) {
		throw 'Grid with size '+w+'*'+h+' is inconceivable!';
	}

	this.w = w;
	this.h = h;

	var t = this;

	var $grid;
	var horLookup = []; // a list of cells from one row
	var verLookup = []; // a list of cells from one column



	//
	// PUBLIC INTERFACE
	//

	/**
	 * @return {jQuery} grid element
	 */
	this.draw = function() { return draw(); };

	this.getCellWidth = function() {
		if(horLookup.length == 0) {
			throw 'No cells in the grid!';
		}
		return horLookup[0].width();
	};

	this.getCellCoordsFromPoint = function(x, y) {
		return [
			findCoord(horLookup, x, 'left'),
			findCoord(verLookup, y, 'top')
		];
	};




	//
	// IMPLEMENTATION
	//

	var draw = function() {
		horLookup = [];
		verLookup = [];

		$grid = $('<div class="map-grid" />');

		// filling the grid with squares
		for(var w = 0; w < t.w; w++) {
			for(var h = 0; h < t.h; h++) {
				var $cell = $('<div class="map-grid-cell" />');
				$cell.css({
					top:  h + 'em',
					left: w + 'em'
				});
				$grid.append($cell);
				if(w == 0) {
					// once per row
					verLookup.push($cell);
				} else {
					break;
				}
			}
			// once per column
			horLookup.push($cell);
		}
		return $grid;
	};

	var findCoord = function(lookup, val, bound) {
		var n = 0;
		for(var i = 0; i < lookup.length; i++) {
			if(lookup[i].offset()[bound] < val) {
				n = i;
			} else {
				break;
			}
		}
		return n;
	}
};
