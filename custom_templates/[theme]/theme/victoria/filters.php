<?php

namespace Victoria;

use Victoria\Base\Thing;



class Filters extends Thing {

	public function attach_hooks() {
		add_filter( 'rank_math/metabox/priority', array( $this, 'rank_math_metabox_priority' ) );
		add_filter( 'wpseo_metabox_prio', array( $this, 'rank_math_metabox_priority' ) );
	}

	public function rank_math_metabox_priority() {
		return 'low';
	}


}
