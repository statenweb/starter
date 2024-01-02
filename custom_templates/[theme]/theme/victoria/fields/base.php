<?php

namespace Victoria\Fields;

abstract class Base {

	/**
	 * @var string|null
	 */
	protected static $title = null;

	/**
	 * @var string|null
	 */
	protected static $field_name = null;

	public function __construct(){

	}

	abstract public static function fields();
}