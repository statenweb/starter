<?php

namespace Victoria\Settings;

use Victoria\Base;


class Site extends Base {

	const SLUG = 'site_settings';

	public function attach_hooks() {

		add_action( 'init', array( $this, 'add_settings_page' ) );
	}




	public function add_settings_page() {

		if ( function_exists( 'acf_add_options_sub_page' ) ) {
			acf_add_options_sub_page(
				array(
					'page_title'  => 'Site Settings',
					'menu_title'  => 'Site Settings',
					'menu_slug'   => self::SLUG,
					'capability'  => 'edit_users',
					'parent_slug' => 'options-general.php',
				)
			);
		}
	}

	public static function get( $key ) {

		if ( ! function_exists( 'get_field' ) ) {
			return;
		}

		return get_field( $key, 'option' );
	}




}
