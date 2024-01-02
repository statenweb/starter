<?php
$menu_id = 'primary_menu';
?>

<header id="masthead" class="header-shadow z-[2000] relative sticky top-0">
    <div class="container mx-auto flex justify-between w-full">
        <a href="<?php echo home_url('/'); ?>"><h1><?php echo get_bloginfo('title'); ?></h1></a>
        <nav id="site-navigation" class="ml-auto flex items-center">
            <button data-menu-id="<?php echo $menu_id; ?>" class="group hidden mobile-only:!block menu-toggler  mr-5 z-[501]" aria-controls="primary-menu" aria-expanded="false">
                <div class="space-y-[8px] transform duration-300">
					<?php
					$hamburger_string = '<div class="w-8 h-0.5 bg-body-text hover:opacity-70 duration-300 transition-all"></div>';
					echo wp_kses_post( implode("\n", array_fill(0, 3, $hamburger_string)) );

					?>
                </div>
            </button>


            <div id="<?php echo esc_attr($menu_id); ?>" class=" relative responsive-menu">
				<?php
				wp_nav_menu(
					array(
						'theme_location'  => 'menu-1',
                        'menu_id' => $menu_id,
						'container' => false,
						'menu_class' => 'menu-list',
						'walker'          => new \Victoria\Tailwind_Navwalker(),
						'depth'           => 2,
					));
				?>
            </div>
    </div><!-- #site-navigation -->
    </nav>
</header>
