
// to do
//
// UI:
// multiple tokens on the same square
// token library, creating new tokens from it
// selecting tokens
// removing tokens
// tools, tool selection
// drawer on the right
//
// tools that we need:
// ruler arrow (toggle enabled/disabled in any mode from the selected token) to show distance
// constructor mode (add/remove tokens)
// battle mode (select token to show attack rolls etc)
// inventory (select token to show items/effects)
// stats (select token to show drawer with stats and scores)

// candy:
// when moving a big token, the arrow should be positioned relative to its center
// big token without image should have a nice huge letter in it
// minimum zoom out
// ipad support for player mode

// dealing with multiple tokens on the same square:
// right click should make a context menu with all tokens there,
// click one to move it to top

// log of actions and undo

// player mode (no sidebar)


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
		name: 'Big Nathan',
		image: 'images/token-nathan.jpg',
		size: [2,2],
		place: [6,9]
	}));
	map.addToken(new Token({
		name: 'Oval statue',
		size: [3,1],
		place: [6,7]
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

