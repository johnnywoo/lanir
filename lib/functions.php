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

	// first map is the default
	$data['current_map'] = reset(array_keys($data['maps'])); // needs the map in the config

	// map names
	foreach($data['maps'] as $name => $map)
	{
		if(empty($map['name']))
			$data['maps'][$name]['name'] = ucfirst($name);
	}

	// adding characters into tokens
	if(!isset($data['tokens']))
		$data['tokens'] = array();
	fill_tokens($data['tokens'], $data, 'Global');
	foreach($data['maps'] as $name => $map)
	{
		fill_tokens($data['tokens'], $map, empty($map['name']) ? $name : $map['name']);
	}


	// installing images into the config
	$pics = glob($folder.'/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
	foreach($pics as $pic)
	{
		$name = basename($pic);
		if(preg_match('/^map[_-](.*?)[_-](\d+)x(\d+)\.[a-z]+$/', $name, $m))
		{
			$data['maps'][$m[1]]['image'] = make_temporary_public_file($pic);
			$data['maps'][$m[1]]['size']  = array($m[2], $m[3]);
		}
		else if(preg_match('/^token[_-](.*?)(?:[_-](\d+)x(\d+))?\.[a-z]+$/', $name, $m))
		{
			$tmp_pic_file = make_temporary_public_file($pic);

			$data['images'][$m[1]] = $tmp_pic_file;

			if(empty($data['tokens'][$m[1]]))
				$data['tokens'][$m[1]] = array('name' => ucfirst($m[1]));

			$data['tokens'][$m[1]]['image'] = $tmp_pic_file;
			if($m[2])
				$data['tokens'][$m[1]]['size'] = array($m[2], $m[3]);
		}
	}

	return $data;
}

function fill_tokens(&$tokens, $entity, $group = 'Whatever', $prefix = '')
{
	foreach(array('pc', 'npc', 'tokens') as $kind)
	{
		if(!empty($entity[$kind]))
		{
			foreach($entity[$kind] as $name => $opts)
			{
				$tokens[$prefix.$name] = (isset($tokens[$prefix.$name]) ? $tokens[$prefix.$name] : array()) + $opts;
				if(empty($tokens[$prefix.$name]['group']))
					$tokens[$prefix . $name]['group'] = ($kind == 'pc') ? 'PC' : $group;
			}
		}
	}
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
