// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
if (! (typeof window != 'undefined' && window.document)) {
    var async = require('async');
    var fs = require('fs');
}
// @endif

Class.create('WebServer',Entity,{
    initialize: function($super,guid) {
        $super(guid);
        var me = this;
        if (me.isServer()) {
            me.config = require('../../../config/webserver.js');
            me.express = require('express')
            me.app = me.express();
            me.web_server = require('http').createServer(me.app);
            me.socket_server = require('socket.io')(me.web_server);
            me.configure();
            me.setListeners();
        } else {
            window.templates = {};
        }
    },
    
    configure: function() {
        var me = this;
        me.app.set('view engine', 'ejs');
        me.app.set('views', './templates');
        me.express_session = require('express-session');        
        me.app.use(me.express.static('public'));
        me.app.use(me.express_session({secret: me.config.session_secret}));
    },

    run: function() {
        var me = this;
        if (me.isServer()) {
            me.web_server.listen(me.config.port);
        }
    },
    
    setListeners: function($super) {
        var me = this;
        $super();
        if (me.isServer()) {
            me.app.use(function(req,res,next) {
                Objects['Auth'].authenticate(req,function(err) {
                    if (err) {
                        res.redirect('/auth/login');
                    }
                    else {
                        next();
                    }
                });
            });
            me.app.use(function(req,res,next) {
                me.emit('web_server_request',{req: req, res: res, next: next});
            });
        }
    }
});
