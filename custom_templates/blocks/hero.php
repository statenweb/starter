
<?php

use Victoria\Utils;

$id          = basename( __FILE__ ) . $block['id'];
$align_class = $block['align'] ? 'align' . $block['align'] : '';
$class_name   = '';
if ( ! empty( $block['className'] ) ) {
    $class_name .= ' ' . $block['className'];
}
if ( ! empty( $block['align'] ) ) {
    $class_name .= ' align' . $block['align'];
}



?>

<section id="<?php echo esc_attr( $id ); ?>" class="<?php echo esc_attr( $class_name ); ?>">
	

</section>

