<?php

require_once __DIR__.'/../lib/functions.php';

$game_name = 'test';
$game = get_game_folder($game_name);

$game_data = load_game_data($game);

$is_readonly_mode = empty($_REQUEST['gm']); // mightily secure

$log_entries = log_read($game_name);

?>
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

<script type="text/javascript">

// to do
//
// remove token logic from backend
// load all the data into JS and process there
// log should operate on game objects, not map tokens
// think about problems with making actions while log is loading (should not be an issue with one GM and readonly players)


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
// map changing
// real-time remote pointer
// saving/loading the game state
// log of actions and undo
//
// Battle mode:
// initiative and rounds, who acted this round
// select a char token to show roll to hit on all other tokens
// char inventory and current weapon selection


// NOT ESSENTIAL:
//
// Constructor mode:
// adding tokens
// removing tokens

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



//
// DATA
//

var gameData       = <?=json_encode($game_data)?>;
var isReadonlyMode = <?=json_encode($is_readonly_mode)?>;

$(function() {

	//
	// INITIALIZATION
	//

	if(isReadonlyMode) {
		$('body').addClass('readonly-mode');
	}

    var map      = initMap(gameData, isReadonlyMode);
    var tokenLib = initTokenLib(gameData);
	var gameLog  = new GameLog({
		url: 'log.php?game='+encodeURIComponent(gameData.name)
	});
	// the main bloody object to rule them all
	var game = new Game({
		data: gameData,
		map:  map,
		log:  gameLog
	});



	//
	// UI
	//

	var normView = function() {
		map.removeZoom();
		map.centerView();
	};
	normView();
	$('#centerViewBtn').click(normView);
	$(document).bind('keydown', 'ctrl+0 meta+0', normView);
});



//
// HELPERS
//

function initMap(gameData, isReadonlyMode) {
	if(!gameData.current_map || !gameData.maps || !gameData.maps[gameData.current_map]) {
		alert('No map!');
		throw 'Bleeeegh';
	}
	var mapData = gameData['maps'][gameData['current_map']];

	var map = new Map({
		$container:    $('#canvas'),
		size:          mapData.size, // hor, ver
		mapImage:      mapData.image,
		movableTokens: !isReadonlyMode
	});

	// while we don't have adding/removing tokens, we just throw all tokens onto the map
	// when we will have that, it would make sense to only add tokens with a defined place
	if(gameData.tokens) {
		$.each(gameData.tokens, function(name, options) {
			map.addToken(new Token(options));
		});
    }

	return map;
}

function initTokenLib(gameData) {
	var tokenLib = new TokenLibrary($('#token-library'));

	if(gameData.tokens) {
		$.each(gameData.tokens, function(name, options) {
			tokenLib.addToken(options.group || 'Random crap', new Token(options));
		});
	}

    return tokenLib;
}

</script>

<link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>

<div id="canvas">
</div>

<div id="sidebar">
    <div id="token-library" class="drawer">
    </div>
    <div id="help-drawer" class="drawer">
        <div class="drawer-title">Tips</div>
        <button id="centerViewBtn" class="keyboard-shortcut">⌘0</button> Center view<br />
        Right-drag moves the map. <br />
        Left-drag moves tokens or the map. While moving a token, right click to add a waypoint.
    </div>
</div>

</body>
</html>
