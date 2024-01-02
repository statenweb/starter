<?php

namespace Victoria\Fields;
use StoutLogic\AcfBuilder\FieldsBuilder;

class Text extends Base {
	public static function fields(){
		$text = new FieldsBuilder(static::$field_name);
		$text
			->addText(static::$field_name, [
				'label' => static::$title,

			]);
		return $text;
	}
}