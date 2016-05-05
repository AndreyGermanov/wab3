// @if MODE='server'
require("../../oop.js");
require("../core/model.js");
var sha1 = require('sha1');
// @endif

Class.create('User',Model, {
    get_boo: function(params) {
        params.res.end('BOO!');
    }

});

Class.new('User','User_factory');

