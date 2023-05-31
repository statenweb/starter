<?php

use Victoria\Actions;
use Victoria\Enqueues;
use Victoria\Filters;
use Victoria\Settings\Site;
use Victoria\Blocks\Hero;



$namespace = ['Victoria'];

\spl_autoload_register(
	function ( $class ) use ( $namespace ) {
		$base = explode( '\\', $class );
		if ( in_array( $base[0], $namespace ) ) {
			$file = __DIR__ . DIRECTORY_SEPARATOR . strtolower(
					str_replace(
						[ '\\', '_' ],
						[
							DIRECTORY_SEPARATOR,
							'-',
						],
						$class
					) . '.php'
				);
			if ( file_exists( $file ) ) {
				require $file;
			} else {
				wp_die( sprintf( 'File %s not found', esc_html( $file ) ) );
			}
		}

	}
);

$actions = new Actions;
$actions->init();

$enqueues = new Enqueues();
$enqueues->init();

$filters = new Filters();
$filters->init();

$site = new Site();
$site->init();

$hero = new Hero();
$hero->init();