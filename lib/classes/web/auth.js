// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
var sha1 = require('sha1');
// @endif

Class.create('Auth',Entity,{
    initialize: function($super,options) {
        $super(options);
        var me = this;
        if (me.isServer()) {
            me.web_server = Objects['WebServer'];
            me.config();
            me.setListeners();
        }
    },
    
    config: function() {
        var me = this;

        if (!Objects['User_factory']) {
            require("../models/user.js");
            Class.new('User','User_factory');
        }
    },
    
    authenticate: function(type, req,callback) {
        if (type=='http') {
            if (req.url.search('/auth/login') != -1 || req.session.user) {
                callback();
            } else {
                callback(true);
            }
        } else if (type=='websocket') {
            if (req.event=='login' || req.session.user) {
                callback();
            } else {
                callback(true);
            }
        }
    },
    
    get_login: function(params) {
        var me = this;
        me.show('login',params.res,{});
    },

    get_logout: function(params) {
        var req = params.req, res = params.res;
        req.logout();
        res.redirect('/');
    },

    socket_login: function(params) {
        //return;
        var callback = params.callback;
        Objects['User_factory'].find({login: params.login}, function(err, user) {
            if (err) { callback({status:'error',message: err.message}); };
            if (!user) {
                callback({status:'error',message: 'Incorrect username'});
                return;
            };
            if (user.password != sha1(params.password)) {
                callback({status:'error',message: 'Incorrect password'});
                return;
            }
            params.socket.session.user = user.guid;
            Objects['WebServer'].sessionStore.set(Objects['WebServer'].sid,params.socket.session, function() {
                callback({status: 'ok', user: user.guid});
            });

        });
    },

    onLoginSubmit: function(login,password,callback) {
        Objects['WebServer'].sendMessage('login',{login:login,password:password},callback);
    },

});
