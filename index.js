// @if MODE='server'
require("./bower_components/react/react-with-addons.min.js");
require("./bower_components/jquery/dist/jquery.min.js");
require("./lib/classes/web/webserver.js");
require("./lib/classes/core/db.js");
require("./lib/classes/web/auth.js");
require("./lib/classes/core/model.js");
// @endif
Class.new('Db','Db');
var server = Class.new('WebServer','WebServer');
Class.new('Auth','Auth');

