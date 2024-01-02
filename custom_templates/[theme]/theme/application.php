<?php

use Victoria\Actions;
use Victoria\Enqueues;
use Victoria\Filters;
use Victoria\Settings\Site;
use Victoria\Blocks\Hero;



$actions = new Actions;
$actions->init();

$enqueues = new Enqueues();
$enqueues->init();

$filters = new Filters();
$filters->init();

$site = new Site();
$site->init();
