/********** require global modules **********/
global.jQuery = require('jquery');
global.$ = require('jquery');
require('bootstrap');
require('../css/vendor/bootstrap.css');
require('../css/global.css');
require('./global');

/********** require custom modules **********/
var html = $('html');

if(html.hasClass('t1')){
require('../css/t1.css');
require('./t1');
}
