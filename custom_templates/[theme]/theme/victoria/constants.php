<?php

namespace Victoria;

class Constants {
	public static function get($key = null) {
		$constants = (array)self::inner_get();
		if ( $key ) {
			if(!array_key_exists($key, $constants)){
				return '';
			}
			return $constants[ $key ];
		}
		return $constants;
	}

	private static function inner_get(){
		return array(
			'menu-item' => 'text-[#C20000] hover:text-[#00ADEF] duration-300 transition-all text-[lg] px-5 py-3',
			'hamburger-color' => 'bg-navy group-hover:bg-[#c20000]',
		);
	}

}
