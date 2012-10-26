
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

$(function(){

	var map = new Map({
		$container: $('#canvas'),
		size: [23, 19], // hor, ver
		mapImage: 'images/cemetery.jpg'
	});

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

