<?php

namespace Victoria\Fields;
use StoutLogic\AcfBuilder\FieldsBuilder;


class Medium extends Base {

	public static function fields(){
		$medium = new FieldsBuilder('pretitle');
		$medium
			->addField(static::$field_name, 'medium_editor', [
				'label' => static::$title,
		]);
		return $medium;
	}

}