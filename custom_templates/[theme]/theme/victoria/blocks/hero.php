<?php

namespace Victoria\Blocks;

use StoutLogic\AcfBuilder\FieldsBuilder;
use Victoria\Base\Block;
use Victoria\Fields\Background_Image;
use Victoria\Fields\Subtitle;
use Victoria\Fields\Title;


class Hero extends Block {

	const BLOCK_SLUG = 'hero';
	const BLOCK_NAME = 'StatenWeb Hero';

	public function attach_hooks() {
		if ( function_exists( 'acf_register_block_type' ) ) {
			add_action( 'acf/init', array( $this, 'register' ) );
		}
	}

	public function register() {
		// register a testimonial block.
		acf_register_block_type(
			array(
				'name'            => static::get_name(),
				'title'           => __( self::BLOCK_NAME ),
				'description'     => __( self::BLOCK_NAME ),
				'render_template' => sprintf('block/%s.php', self::BLOCK_SLUG),
				'category'        => 'common',
				'icon'            => 'admin-site',
				'keywords'        => array( self::BLOCK_NAME ),
				'align'           => 'full',
				'mode'			=> 'preview',
				'supports'		=> [
					'align' 			=> false,
					'color' 			=> [
						'background' 	=> true,
						'text' 			=> true,
					],
					'dimensions' => [
						'minHeight' 	=> true,
					],
					'jsx' 			=> true,
				],
				'enqueue_assets'  => function() {
				},
			)
		);
	}

	public function register_fields(): ?FieldsBuilder {
		$section = new FieldsBuilder('section');

		$section

			->addFields(Title::fields())
			->addFields(Subtitle::fields())
			->addFields(Background_Image::fields())

			->setLocation('block', '==', 'acf/'  . self::get_name());
		return $section;
	}

}
