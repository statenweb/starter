<?php

namespace Victoria;

use Victoria\Base;


class Actions extends Base {


	public function attach_hooks() {

		add_action('after_setup_theme', array($this, 'image_sizes'));


	}

	public function image_sizes(){

	}


}

