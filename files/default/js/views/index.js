/**** Initialize ****/
// inject:js
require('../initialize.js');
// endinject
/* jshint ignore:start */
<!-- build:css -->

// inject:app
require('../../css/views/index.css');
// endinject

<!-- endbuild -->
/* jshint ignore:end */
/**** Initialize ****/
/**** Customise ****/
require('./inc/global');
$(document).ready(function(){
    console.log('Here is Index2');
});
/**** Customise ****/
