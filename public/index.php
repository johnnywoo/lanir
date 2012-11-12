<?php

require_once __DIR__.'/../lib/functions.php';

$game_name = 'test';
$game = get_game_folder($game_name);

$game_data = load_game_data($game);
$is_readonly_mode = empty($_REQUEST['gm']); // mightily secure
$only_load_once   = !empty($_REQUEST['only_load_once']);

?>
<!DOCTYPE html>
<html>
<head>
<title>Lanir</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />

<script type="text/javascript" src="vendor/jquery-1.8.2.min.js"></script>
<script type="text/javascript" src="vendor/jquery.mousewheel.js"></script>
<script type="text/javascript" src="vendor/jquery.hotkeys.js"></script>

<script type="text/javascript" src="js/drag-drop.js"></script>
<script type="text/javascript" src="js/map-grid.js"></script>
<script type="text/javascript" src="js/token.js"></script>
<script type="text/javascript" src="js/shape-arrow.js"></script>
<script type="text/javascript" src="js/map.js"></script>
<script type="text/javascript" src="js/token-library.js"></script>
<script type="text/javascript" src="js/game-log.js"></script>
<script type="text/javascript" src="js/game.js"></script>
<script type="text/javascript" src="js/character.js"></script>
<script type="text/javascript" src="js/fog-of-war.js"></script>

<script type="text/javascript">

// to do
//
// describe all characters in one place in game config, use lists of names in other places?
// separate config sections for characters and their tokens on the map?
// ('token' is exclusively map UI element, token config = representation;
// for non-character things like blood use 'objects';
// token config should have image/text/color info)
// think about problems with making actions while log is loading (should not be an issue with one GM and readonly players)


// ESSENTIAL:
//
// General map features:
// dealing with multiple tokens on the same square
// drawing HP on tokens
// drawing conditions on tokens
// fog of war
//
// General everything features:
// real-time remote pointer
//
// Battle mode:
// initiative and rounds, who acted this round (with regards to inactive tokens)
// select a char token to show roll to hit on all other tokens
// char property editing
// char inventory and current weapon selection


// NOT ESSENTIAL:
//
// Constructor mode:
// adding tokens
// removing tokens
//
// General everything features:
// map changing
// displaying the log of actions and undo


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
// token representation separate from tokens themselves (pick image by name/keywords/properties etc)
// list of standard unicode/shape-based token representations (for status effects, actual tokens, etc)
// optionally drawing a grid (color in the map settings) as one element (or at most w+h instead of w*h); we need the grid to be visible to align it to the drawn grid on the map
// doctoring of the applied log? we can have a very large amount of move commands because every select is a move, so the log will tend to become enormous (and we need the moves to keep proper z-index on tokens)

// dealing with multiple tokens on the same square:
// mark such squares with some icon (how do we deal with big tokens?)
// have a keyboard shortcut to cycle between tokens under cursor


// effects have defining properties
// target: owner, character, blast (size, from owner/place)
// melee weapon is an effect on target in (reach) radius

// token borders should describe health level (green for 100%, red for 0)
// items should not have a border
// conditions on tokens
// separate condition icons from conditions themselves, instead just have
// conditions (+attack, and their collections like bless) and
// icons associated with their names, so icons can be made generic etc



//
// DATA
//

var gameData        = <?=json_encode($game_data)?>;
var isReadonlyMode  = <?=json_encode($is_readonly_mode)?>;
window.onlyLoadOnce = <?=json_encode($only_load_once)?>; // hackerish flag to prevent insane traffic while debugging

$(function() {

	//
	// INITIALIZATION
	//

	if(isReadonlyMode) {
		$('body').addClass('readonly-mode');
	}

	//var tokenLib = new TokenLibrary($('#token-library')); // useless for now
	var gameLog = new GameLog({
		url: 'log.php?game='+encodeURIComponent(gameData.name)
	});
	// the main bloody object to rule them all
	var game = new Game({
		data:             gameData,
		log:              gameLog,
		$mapContainer:    $('#canvas'),
		$editorContainer: $('#editor-drawer'),
		isReadonlyMode:   isReadonlyMode
	});



	//
	// UI
	//

	var normView = function() {
		game.map.removeZoom();
		game.map.centerView();
	};
	normView();
	$('#centerViewBtn').click(normView);
	$('#drawFogBtn').click(game.map.fog.draw);
	$(document).bind('keydown', 'ctrl+0 meta+0', normView);
	$(document).bind('keydown', 'ctrl+f meta+f', game.map.fog.draw);
});

</script>

<link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>

<div id="canvas">
</div>

<div id="sidebar">
	<!-- <div id="token-library" class="drawer"></div> -->
	<div id="editor-drawer" class="drawer"></div>
    <div id="help-drawer" class="drawer">
        <div class="drawer-title">Tips</div>
        <button id="centerViewBtn" class="keyboard-shortcut">⌘0</button> Center view<br />
        <button id="drawFogBtn" class="keyboard-shortcut">⌘f</button> Draw fog of war<br />
        Right-drag moves the map. <br />
        Left-drag moves tokens or the map. While moving a token, right click to add a waypoint.
    </div>
</div>

</body>
</html>
