
// to do
//
// UI:
// tokens
// dragging tokens
// selecting tokens
// tools, tool selection
// drawer on the right
//
// tools that we need:
// ruler arrow (toggle enabled/disabled in any mode from the selected token) to show distance
// constructor mode (add/remove tokens)
// battle mode (select token to show attack rolls etc)
// inventory (select token to show items/effects)
// stats (select token to show drawer with stats and scores)
//
// candy:
// zoom the map around cursor


// effects have defining properties
// target: owner, character, blast (size, from owner/place)
// melee weapon is an effect on target in (reach) radius

// token borders should describe health level (green for 100%, red for 0)
// items should not have a border
// conditions on tokens
// separate condition icons from conditions themselves, instead just have
// conditions (+attack, and their collections like bless) and
// icons associated with their names, so icons can be made generic etc



function createTokens(map) {
	map.addToken(new Token({
		name: 'Statue',
		place: [9,9]
	}));
	map.addToken(new Token({
		name: 'Nathan',
		image: 'images/token-nathan.jpg',
		place: [9,10]
	}));
	map.addToken(new Token({
		name: 'Big statue',
		size: [2,2],
		place: [6,9]
	}));
	map.addToken(new Token({
		name: 'Oval statue',
		size: [3,1],
		place: [6,7]
	}));
	map.addToken(new Token({
		name: 'Huge statue',
		size: [7,7],
		place: [12,8]
	}));
}

$(function(){

	var map = new Map({
		$container: $('#canvas'),
		size: [23, 19], // hor, ver
		mapImage: 'images/cemetery.jpg'
	});

	createTokens(map);

	map.removeZoom();
	map.centerView();

	$('#centerViewBtn').click(function(){
		map.removeZoom();
		map.centerView();
	});

	$(document).bind('keydown', 'ctrl+0 meta+0', function() {
		map.removeZoom();
		map.centerView();
	});
});

