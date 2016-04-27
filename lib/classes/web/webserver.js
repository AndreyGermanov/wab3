require("../../oop.js");
require("../core/entity.js");

Class.create('WebServer',Entity,{
    initialize: function($super,name) {
        $super(name);
        var me = this;
        if (me.isServer()) {
            me.config = require('../../../config/webserver.js');
            me.app = require('express')();
            me.web_server = require('http').createServer(me.app);
            me.socket_server = require('socket.io')(me.web_server);
            me.setListeners();
        }
    },
    
    run: function() {
        var me = this;
        me.web_server.listen(me.config.port);
    },
    
    setListeners: function($super) {
        var me = this;
        $super();
        if (me.isServer()) {
            me.app.use(function(req,res,next) {
                me.emit('web_server_request',{req: req, res: res, next: next});
            });
        }
    }
});
