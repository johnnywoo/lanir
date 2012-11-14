<?php

/**
 * First draft, expect things to be extremely ugly
 */


/**
 * @param string $name
 * @return string
 */
function get_game_folder($name)
{
	return dirname(__DIR__).'/games/'.$name;
}

function load_game_data($folder)
{
	$data = json_decode(file_get_contents($folder . '/game.json'), true);

	$data['name'] = basename($folder);

	// installing images into the config
	$pics = glob($folder.'/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
	foreach($pics as $pic)
	{
		$name = basename($pic);
		if(preg_match('/^map[_-](.*?)[_-](\d+)x(\d+)\.[a-z]+$/', $name, $m))
		{
			$data['maps'][$m[1]]['image'] = make_temporary_public_file($pic);
			$data['maps'][$m[1]]['size']  = array((int) $m[2], (int) $m[3]);
		}
		else if(preg_match('/^token[_-](.*?)(?:[_-](\d+)x(\d+))?\.[a-z]+$/', $name, $m))
		{
			$tmp_pic_file = make_temporary_public_file($pic);

			$data['tokens'][$m[1]]['image'] = $tmp_pic_file;
			if($m[2])
				$data['tokens'][$m[1]]['size'] = array((int) $m[2], (int) $m[3]);
		}
	}

	return $data;
}

function make_temporary_public_file($fname)
{
	$base = dirname(__DIR__); // we're in lib/

	if(strpos($fname, $base.'/') !== 0)
		throw new Exception('Inconceivable!');

	$new_basename = preg_replace('#[/\\\\]#', '__', substr($fname, strlen($base.'/')));
	$tmp_name = $base.'/public/tmp/'.$new_basename;

	if(!file_exists(dirname($tmp_name)))
		mkdir(dirname($tmp_name), 0777, true);

	copy($fname, $tmp_name);
	return 'tmp/'.$new_basename;
}

function log_write($game, $entry)
{
	$folder = get_game_folder($game);
	$log = $folder.'/log.json';

	$data = log_read($game);
	$data[] = $entry;

	file_put_contents($log, json_encode($data));
}

function log_read($game)
{
	$folder = get_game_folder($game);
	$log = $folder.'/log.json';
	if(!file_exists($log))
		file_put_contents($log, json_encode(array()));

	return json_decode(file_get_contents($log), true);
}
