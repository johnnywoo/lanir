
// to do
//
// ESSENTIAL:
//
// General map features:
// dealing with multiple tokens on the same square
// drawing HP on tokens
// drawing conditions on tokens
// fog of war
// selecting a token
//
// General everything features:
// configurable maps (what tokens to offer, image, size, etc etc)
// map changing
// real-time remote pointer
// saving/loading the map state
// log of actions and undo
// player mode (no sidebar)
//
// Constructor mode:
// adding tokens
// removing tokens
//
// Battle mode:
// initiative and rounds, who acted this round
// select a char token to show roll to hit on all other tokens
// char inventory and current weapon selection


// CANDY:
// when moving a big token, the arrow should be positioned relative to its center
// big token without image should have a nice huge letter in it
// minimum zoom out
// ipad support for player mode
// creating text tokens with UI (in library and on the field)
// deleting tokens from the library
// group token library by PC/NPC, on field/not on field, etc
// ruler arrow tool (creates an arrow visible to other players)
// GM-only tokens invisible to players

// dealing with multiple tokens on the same square:
// mark such squares with some icon (how do we deal with big tokens?)
// have a keyboard shortcut to cycle between tokens under cursor


// Offline storage should be a folder with a JSON file
// and images with meaningful names (map-cemetery-23x34.jpg, pc-tolkor.jpg)
// do we write a log into the same file?

// effects have defining properties
// target: owner, character, blast (size, from owner/place)
// melee weapon is an effect on target in (reach) radius

// token borders should describe health level (green for 100%, red for 0)
// items should not have a border
// conditions on tokens
// separate condition icons from conditions themselves, instead just have
// conditions (+attack, and their collections like bless) and
// icons associated with their names, so icons can be made generic etc



function createTokenLib(lib) {
	lib.addToken('PC', new Token({
		name: 'Nathan',
		image: 'images/token-nathan.jpg',
		place: [9,10]
	}));
	lib.addToken('PC', new Token({
		name: 'Big Nathan',
		image: 'images/token-nathan.jpg',
		size: [2,2],
		place: [6,9]
	}));
	lib.addToken('Cemetery', new Token({
		name: 'Statue',
		place: [9,9]
	}));
	lib.addToken('Cemetery', new Token({
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

	var tokenLib = new TokenLibrary($('#token-library'));

	createTokenLib(tokenLib);

	map.removeZoom();
	map.centerView();

	$('#centerViewBtn').click(function() {
		map.removeZoom();
		map.centerView();
	});

	$(document).bind('keydown', 'ctrl+0 meta+0', function() {
		map.removeZoom();
		map.centerView();
	});
});

