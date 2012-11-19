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

<script type="text/javascript" src="js/ui/drag-drop.js"></script>
<script type="text/javascript" src="js/ui/map-grid.js"></script>
<script type="text/javascript" src="js/ui/token.js"></script>
<script type="text/javascript" src="js/ui/shape-arrow.js"></script>
<script type="text/javascript" src="js/ui/map.js"></script>
<script type="text/javascript" src="js/ui/game-log.js"></script>
<script type="text/javascript" src="js/ui/fog-of-war.js"></script>

<script type="text/javascript" src="js/game.js"></script>
<script type="text/javascript" src="js/token-library.js"></script>
<script type="text/javascript" src="js/character.js"></script>
<script type="text/javascript" src="js/item.js"></script>
<script type="text/javascript" src="js/damage.js"></script>

<script type="text/javascript">

// to do
//
// describe all characters in one place in game config, use lists of names in other places?
// think about problems with making actions while log is loading (should not be an issue with one GM and readonly players)



// ESSENTIAL:
//
// General map features:
// dealing with multiple tokens on the same square
//
// Fog of war:
// proper dnd trigonometry
// remembering previously seen places
// tokens hidden under the fog
// sync of fog refreshing on server
// black map before first refresh
// only count PCs as seeing tokens
// prevent page search from popping up on ctrl+f
// remove visibility calculation from the fog object; make it accept a callback to calculate currently visible cells, so the game logic would not be present in the universal fog object
//
// General everything features:
// real-time remote pointer
//
// Battle mode:
// initiative and rounds, who acted this round (with regards to inactive tokens)
// battle log
// click target in attack mode: if PC, ask for damage; if NPC, auto roll and set everything
// select char, press 'd' to damage/heal (with negative number?) with popup asking for a number/dice (buttons for predefined dice for e.g. spells)
//
// Character editor:
// roll table? like 'perception: 5 ok, 10 good, 15 very good' or just 'perception +5'


// NOT ESSENTIAL:
//
// Constructor mode:
// adding tokens
// removing tokens
//
// General everything features:
// map changing
// displaying the log of actions and undo
//
// Editors:
// unique IDs for items instead of char/pos
// refactoring of item management code
// proper item param management
// adding/removing items
// moving items between characters
// (candy) separate modes for editing/viewing so we can see bonuses on stats etc?
// proper change system where we can react on CON change when character equips a CON+1 ring


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
// map config: fog enabled/disabled (maybe for some locations like safe towns/taverns we don't need the fog)
// drawing condition icons in character editor
// fix doubleclick not working properly on checkbox labels (it should simply count as two separate clicks and no text selection should take place)
// make gradient hp coloring instead of discrete colors

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
	$(document).bind('keydown', 'ctrl+0 meta+0', normView);
	if(!isReadonlyMode) {
		// fog control
		$('#drawFogBtn').click(game.map.fog.draw);
		$('#showFogBtn').click(game.map.fog.toggle);
		$(document).bind('keydown', 'ctrl+f meta+f', game.map.fog.draw);
		$(document).bind('keydown', 'f', game.map.fog.toggle);

		// attack mode
		$('#attackModeBtn').click(game.toggleAttackMode);
		$(document).bind('keydown', 'a', game.toggleAttackMode);
	}
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
		<? if(empty($is_readonly_mode)) { ?>
		<button id="drawFogBtn" class="keyboard-shortcut">⌘F</button> Draw fog of war<br />
		<button id="showFogBtn" class="keyboard-shortcut">F</button> Show/hide fog of war<br />
		<button id="attackModeBtn" class="keyboard-shortcut">A</button> Attack mode on/off<br />
		<? } ?>
		Right-drag moves the map. <br />
		Left-drag moves tokens or the map. While moving a token, right click to add a waypoint.
</div>
</div>

</body>
</html>
