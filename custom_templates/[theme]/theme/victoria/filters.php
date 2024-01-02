<?php

namespace Victoria;


class Filters extends Base {

	public function attach_hooks() {
		add_filter( 'rank_math/metabox/priority', array( $this, 'rank_math_metabox_priority' ) );
		add_filter( 'wpseo_metabox_prio', array( $this, 'rank_math_metabox_priority' ) );
		add_filter('nav_menu_link_attributes', array($this, 'nav_menu_link_attributes') );
	}

	public function nav_menu_link_attributes($atts){
		$current_class = is_array($atts) && array_key_exists('class', $atts) ? $atts['class'] : '';
		$atts['class'] = $current_class . ' text-body-text hover:opacity-70 duration-300 transition-all px-5 py-3';
		return $atts;
	}

	public function rank_math_metabox_priority() {
		return 'low';
	}


}
