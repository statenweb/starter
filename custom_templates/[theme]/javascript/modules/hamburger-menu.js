jQuery(document).ready(function($){

	$('.menu-toggler').on('click', function(){

		const parentContainerId = $(this).attr('data-menu-id');
		const $parentContainer = $(`#${parentContainerId}`);
		$(this).attr('aria-expanded', $(this).attr('aria-expanded') === "true" ? "false" : "true");

		$parentContainer.toggleClass( 'mobile-only:!translate-y-0' );


	});
	const resetActiveMenus = () => {
		// timeout pushes to bottom of queue
		setTimeout(
			function(){
				$( '.dropdown-menu' ).each(
					function(){
						let active = false
						if ($( this ).hasClass( 'flex' )) {
							active = true
						}
						const $elementToActUpon = $( this ).siblings( '.dropdown-toggle,.dropdown-toggle-l2' );
						$elementToActUpon.attr( 'aria-expanded', active ? 'true' : 'false' );
						if ( ! ! active) {
							$elementToActUpon.addClass( 'active' )
						} else {
							$elementToActUpon.removeClass( 'active' );
						}
					}
				);
			},
			100
		);
	}

	$( '.menu-item-has-children' ).on(
		'click',
		function(e){


			if (! $( e.target ).hasClass( 'dropdown-toggle' ) && ! $( e.target ).hasClass( 'dropdown-toggle-l2' )) {

				return true;
			}

			e.preventDefault();
			e.stopPropagation();
			const thisClasses = '.' + $( this ).attr( 'class' ).split( ' ' ).join( '.' );

			if ( $( e.target ).hasClass( 'dropdown-toggle' ) ) {


				$( '.dropdown-menu.flex.l1' ).not( thisClasses + ' .dropdown-menu.flex' ).toggleClass( 'hidden' ).toggleClass( 'flex' );
				$( this ).find( '.dropdown-menu.l1' ).toggleClass( 'hidden' ).toggleClass( 'flex' ).siblings( 'a' ).toggleClass( 'active' );
			} else {
				$( '.dropdown-toggle-l2' ).siblings('.dropdown-menu').toggleClass('hidden').toggleClass('flex');
				// $( this ).find( '.dropdown-menu' ).toggleClass( 'hidden' ).toggleClass( 'flex' ).siblings( 'a' ).toggleClass( 'active' );
			}

			resetActiveMenus();
		}
	);
	$( document ).on(
		'click',
		function(){
			$( '.dropdown-menu.flex' ).toggleClass( 'hidden' ).toggleClass( 'flex' );
			resetActiveMenus();
		}
	);

	$( document ).keyup(
		function(e) {
			if (e.key === "Escape") { // escape key maps to keycode `27`

				$( '.dropdown-menu.flex' ).toggleClass( 'flex' ).toggleClass( 'hidden' ).siblings( 'a' ).toggleClass( 'active' );
				resetActiveMenus();
			}
		}
	);

	$( '.stop-propagation' ).on(
		'click',
		function(e){
			e.stopPropagation();
		}
	);
});
