// @if MODE='server'
require("../../oop.js");
require("../core/model.js");
var sha1 = require('sha1');
// @endif

Class.create('User',Model, {
    initialize: function($super,guid) {
      $super(guid);
        var me = this;
    }
});
Class.new('User','User_factory');

