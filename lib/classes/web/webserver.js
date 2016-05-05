// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
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
            me.configure();
        } else {
            me.socket_server = io('http://'+Objects.config.server_ip,{upgrade: false,transports: ['websocket'], query: {cookie: document.cookie}});
        }
        me.setListeners();
    },
    
    configure: function() {
        var me = this;
        me.express = require('express')
        me.app = me.express();
        me.app.set('view engine', 'ejs');
        me.app.set('views', './templates');
        me.app.use(me.express.static('public'));
        me.app.use(bodyParser.urlencoded({ extended: false }));
        me.app.use(cookieParser());
        me.web_server = require('http').createServer(me.app);
        me.express_session = require('express-session');
        var MemoryStore = me.express_session.MemoryStore;
        me.sessionStore = new MemoryStore(me.express_session);
        var session = me.express_session({
            saveUninitialized: true,
            secret: me.config.session_secret,
            resave: true,
            store: me.sessionStore,
            cookie: {httpOnly:false}
        });
        me.app.use(session);
        me.socket_server = require('socket.io')(me.web_server);
    },

    run: function() {
        var me = this;
        if (me.isServer()) {
            me.web_server.listen(me.config.port);
        };
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
                Objects['Auth'].authenticate('http',req,function(err) {
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
            Objects['Db'].on('database_loaded', function() {
                me.run();
            });
        }

        me.socket_server.on('connection', function(socket) {
            if (socket.request._query) {
                var cookies = cookie.parse(socket.request._query.cookie);
                me.cookies = cookies;
                me.sid = cookies['connect.sid'];
                if (me.sid) {
                    me.sid = me.sid.split(':').pop();
                    me.sid = me.sid.split('.').shift();
                    if (me.sessionStore) {
                        me.sessionStore.get(me.sid, function (err, session) {
                            socket.session = session;
                        })
                    }
                }
            };
            socket.on('event', function(params,fn) {
                Objects['Auth'].authenticate('websocket',{event:params.event,session:socket.session},function(err) {
                    if (err) {
                        fn({status:'error',message:'Access denied'});
                    } else {
                        params.callback = fn;
                        params.socket = socket;
                        me.emit('socket_server_request', params);
                    }
                });
            })
        });
    }
});
