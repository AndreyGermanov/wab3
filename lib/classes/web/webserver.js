// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
var bodyParser = require('body-parser')
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
            me.socket_server = io('http://'+Objects.config.server_ip);
        }
    },
    
    configure: function() {
        var me = this;
        me.app.set('view engine', 'ejs');
        me.app.set('views', './templates');
        me.app.use(bodyParser.urlencoded({ extended: false }));
        me.express_session = require('express-session');
        me.sharedsession = require("express-socket.io-session");
        me.app.use(me.express.static('public'));
        var session = me.express_session({secret: me.config.session_secret})
        me.app.use(session);
        me.socket_server.use(me.sharedsession(session,{autoSave:true}));
    },

    run: function() {
        var me = this;
        if (me.isServer()) {
            me.web_server.listen(me.config.port);
        }
    },

    sendMessage: function(event,params,callback) {
        var me = this;
        params['event'] = event;
        me.socket_server.emit('event',params,callback);
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
        me.socket_server.on('connection', function(socket) {
            socket.on('event', function(params,fn) {
                params.callback = fn;
                params.socket = socket;
                me.emit('socket_server_request', params);
            })
        });
    }
});
