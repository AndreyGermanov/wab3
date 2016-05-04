// @if MODE='server'
require("../../oop.js");
require("../core/model.js");
// @endif

Class.create('User',Model);
Class.new('User','User_factory');
