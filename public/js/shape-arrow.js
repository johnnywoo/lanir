var ShapeArrow = function() {
	var points = [[0, 0]]; // [hor, ver]
	var end = [0, 0]; // hor, ver
	// canvas is a rasterized image, so we need to make it big so the shapes would scale well
	var cellSize = 200;
	var makeArrowAtEnd = false;

	var t = this;



	//
	// PUBLIC INTERFACE
	//

	/**
	 * @param {Array.<number>} place
	 * @return {ShapeArrow}
	 */
	this.start = function(place) {
		points[0] = place;
		return t;
	};

	/**
	 * @param {Array.<number>} place
	 * @return {ShapeArrow}
	 */
	this.point = function(place) {
		points.push(place);
		return t;
	};

	/**
	 * @param {Array.<number>} place
	 * @return {ShapeArrow}
	 */
	this.end = function(place) {
		end = place;
		return t;
	};

	/**
	 * @param {boolean} enable default=true
	 * @return {ShapeArrow}
	 */
	this.arrow = function(enable) {
		makeArrowAtEnd = arguments.length ? enable : true;
		return t;
	};

	/**
	 * @param {Array.<number>} place
	 * @return {jQuery}
	 */
	this.draw = function(place) {
		return draw(place || [0, 0]);
	};

	this.getLength = function() {
		return getLength();
	};



	//
	// ENTRAILS
	//

	var getLength = function() {
		var l = 0;
		for(var i = 0; i < points.length; i++) {
			var point     = points[i];
			var nextPoint = points[i + 1] || end;

			// luckily in D&D trigonometry is really easy
			l += Math.max(
				Math.abs(point[0] - nextPoint[0]),
				Math.abs(point[1] - nextPoint[1])
			);
		}
		return l;
	};

	var draw = function(place) {
		// first we need to determine shape size
		var bounds = getBounds();

		var $arrow = $('<canvas class="under-tokens" />')
			.attr({
				width: bounds.width * cellSize,
				height: bounds.height * cellSize
			})
			.css({
				position: 'absolute',
				width:    bounds.width + 'em',
				height:   bounds.height + 'em',
				left:     (place[0] + bounds.left) + 'em',
				top:      (place[1] + bounds.top) + 'em'
			});

		/** @var {CanvasRenderingContext2D} ctx */
		var ctx = $arrow.get(0).getContext('2d');
		ctx.fillStyle   = "maroon";
		ctx.strokeStyle = "gold";
		ctx.lineWidth   = Math.round(cellSize * 0.05);

		// ok, let's draw it
		for(var i = 0; i < points.length; i++) {
			var point = points[i];
			var nextPoint = points[i + 1] || end;
			line(ctx, point[0] - bounds.minX, point[1] - bounds.minY, nextPoint[0] - bounds.minX, nextPoint[1] - bounds.minY);
			if(makeArrowAtEnd && !points[i + 1]) {
				endpoint(ctx, point[0] - bounds.minX, point[1] - bounds.minY, nextPoint[0] - bounds.minX, nextPoint[1] - bounds.minY);
			}
		}

		return $arrow;
	};

	var elementSize = 0.12;

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} fromX
	 * @param {number} fromY
	 * @param {number} toX
	 * @param {number} toY
	 */
	var line = function(ctx, fromX, fromY, toX, toY) {
		// x, y are cell coords

		// drawing the line
		ctx.beginPath();
		ctx.moveTo((fromX + 0.5) * cellSize, (fromY + 0.5) * cellSize);
		ctx.lineTo((toX + 0.5) * cellSize, (toY + 0.5) * cellSize);
		ctx.stroke();

		// drawing the marker
		ctx.beginPath();
		ctx.arc((fromX + 0.5) * cellSize, (fromY + 0.5) * cellSize, cellSize * elementSize, 0, Math.PI * 2, true);
		ctx.fill();
		ctx.stroke();
	};

	var endpoint = function(ctx, fromX, fromY, toX, toY) {
		ctx.save();

		// moving the zero point into the center of our cell
		ctx.translate((toX + 0.5) * cellSize, (toY + 0.5) * cellSize);
		// rotation is done clockwise; straight west is 0, straight east is PI
		// using the almighty wikipedia, we convert plane coordinates into polar ones
		ctx.rotate(Math.atan2(toY - fromY, toX - fromX));

		ctx.beginPath();
		// drawing a triangle facing straight to the east (which was rotated to where the arrow should point)
		var size = elementSize * cellSize;
		/**
		 *   (b)
		 *    |  \
		 *    |    \
		 * (a)|      >(c = 0,0)
		 *    |    /
		 *    |  /
		 *   (d)
		 */
		ctx.moveTo(-size * 3, 0);     // a
		ctx.lineTo(-size * 3, size);  // a-b
		ctx.lineTo(0, 0);             // b-c
		ctx.lineTo(-size * 3, -size); // c-d
		ctx.lineTo(-size * 3, 0);     // d-a
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	};

	var getBounds = function() {
		var bounds = {
			minX: end[0],
			maxX: end[0],
			minY: end[1],
			maxY: end[1]
		};

		for(var i = 0; i < points.length; i++) {
			bounds.minX = Math.min(bounds.minX, points[i][0]);
			bounds.maxX = Math.max(bounds.maxX, points[i][0]);
			bounds.minY = Math.min(bounds.minY, points[i][1]);
			bounds.maxY = Math.max(bounds.maxY, points[i][1]);
		}

		bounds.width  = bounds.maxX - bounds.minX + 1;
		bounds.height = bounds.maxY - bounds.minY + 1;
		bounds.left   = bounds.minX;
		bounds.top    = bounds.minY;

		return bounds;
	};
};
