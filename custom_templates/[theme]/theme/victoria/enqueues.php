<?php

namespace Victoria;

use Victoria\Base\Thing;

class Enqueues extends Thing {

	public function attach_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );
	}

	public function enqueue() {
		wp_enqueue_style( 'statenweb-style', get_stylesheet_uri(), array('sw-fonts'), filemtime( get_template_directory() . '/style.css' ) );
		wp_enqueue_script( 'statenweb-script', get_template_directory_uri() . '/js/script.min.js', array('jquery'), filemtime( get_template_directory() . '/js/script.min.js' ), true );

		wp_localize_script( 'statenweb-script', 'sw', apply_filters( 'sw_localize_script', [

		]));
	}

}
