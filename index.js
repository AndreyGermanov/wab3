require("./lib/classes/web/webserver.js");
require("./lib/classes/core/db.js");
require("./lib/classes/web/auth.js");
require("./lib/classes/core/model.js");
var server = Class.new('WebServer','WebServer');
Class.new('Db','Db');
Class.new('Auth','Auth');
server.run();
