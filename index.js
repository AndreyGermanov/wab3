require("./lib/classes/core/entity.js");
require("./bower_components/react/react-with-addons.min.js");
require("./bower_components/jquery/dist/jquery.min.js");
var Obj = Class.new('Entity','Entity_1');
Obj.value = 3;
var Obj1 = Class.new('Entity','Entity_2');
if (Obj.isServer()) {
    console.log('Running from Server');
} else {
    console.log('Running from Client');
}
console.log(Objects);
console.log(Class.classes);
