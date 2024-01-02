<?php

namespace Victoria\Base;

use StoutLogic\AcfBuilder\FieldsBuilder;
use Victoria\Base;


abstract class Block extends Base {
	const BLOCK_SLUG = '';
	const BLOCK_NAME = '';

	public function init() {
		parent::init();
		$this->add_fields();
	}

	public function add_fields(){
		$fields = $this->register_fields();
		add_action('acf/init', function() use($fields){
			if(function_exists('acf_add_local_field_group')) {
				acf_add_local_field_group($fields->build());
			}

		});
	}

	abstract public function attach_hooks();

	/**
	 * Can be overridden to return a FieldsBuilder instance.
	 * Returns null by default.
	 *
	 * @return FieldsBuilder|null
	 */
	public function register_fields(): ?FieldsBuilder {
		return null;
	}

	public static function get_name(){
		return sprintf('sw-%s', self::BLOCK_SLUG);
	}



}
