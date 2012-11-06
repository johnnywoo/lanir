<?php

require_once __DIR__.'/../lib/functions.php';

if($_REQUEST['command'] == 'push')
	log_write($_REQUEST['game'], $_REQUEST['entry']);
