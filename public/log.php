<?php

require_once __DIR__.'/../lib/functions.php';

if($_REQUEST['command'] == 'push')
	log_write($_REQUEST['game'], $_REQUEST['entry']);

if($_REQUEST['command'] == 'get')
{
	$skip = empty($_REQUEST['skip']) ? 0 : $_REQUEST['skip'];
	$log = log_read($_REQUEST['game']);
	if(is_array($log))
	{
		$log = array_slice($log, $skip);
		header('Content-type: application/json');
		echo json_encode($log);
	}
}
