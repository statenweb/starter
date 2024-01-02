<?php

namespace Victoria\Fields;
use StoutLogic\AcfBuilder\FieldsBuilder;

class Image extends Base {
	public static function fields(){
		$text = new FieldsBuilder(static::$field_name);
		$text
			->addImage(static::$field_name, [
				'label' => static::$title,
				'return_format' => 'id'

			]);
		return $text;
	}
}