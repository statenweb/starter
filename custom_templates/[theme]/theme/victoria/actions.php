<?php

namespace Victoria;

use Victoria\Base\Thing;


class Actions extends Thing {


	public function attach_hooks() {

		add_action('after_setup_theme', array($this, 'image_sizes'));


	}

	public function image_sizes(){

	}


}

