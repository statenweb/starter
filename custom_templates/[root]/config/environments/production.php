<?php


if ( env( 'WP_ROCKET_KEY' ) ) {
    define( 'WP_ROCKET_KEY', env( 'WP_ROCKET_KEY' ) );
}
// Your email, the one you used for the purchase.
if ( env( 'WP_ROCKET_EMAIL' ) ) {
    define( 'WP_ROCKET_EMAIL', env( 'WP_ROCKET_EMAIL' ) );
}
