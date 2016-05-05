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
        var me = this;
        if (type=='http') {
            if (req.url.search('/auth/login') != -1 || req.session.user) {
                callback();
            } else {
                if (req.cookies.remember_token) {
                    me.socket_login({'user_remember_token':req.cookies.remember_token,req:req,callback:function(result) {
                        if (result.user) {
                            callback();
                        } else {
                            callback(true);
                        }
                    }});
                } else {
                    callback(true);
                }
            }
        } else if (type=='websocket') {
            if (req.event=='login' || req.session.user) {
                callback();
            } else {
                if (Objects['WebServer'].cookies.remember_token) {
                    me.socket_login({'user_remember_token':Objects['WebServer'].cookies.remember_token,req:req,callback:function(result) {
                        if (result.user) {
                            callback();
                        } else {
                            callback(true);
                        }
                    }});
                } else {
                    callback(true);
                }
            }
        }
    },
    
    get_login: function(params) {
        var me = this;
        me.show('login',params.res,{});
    },

    get_logout: function(params) {
        var req = params.req, res = params.res;
        delete req.session.user;
        res.clearCookie('remember_token',{path: '/'});
        res.redirect('/');
    },

    socket_login: function(params) {
        var me = this;
        var callback = params.callback;
        var condition = {login: params.login};
        if (params['user_remember_token']) {
            condition = {remember_token: params['user_remember_token']};
        }
        Objects['User_factory'].find(condition, function(err, user) {
            if (err) { console.log('error here');throw(err);callback({status:'error',message: err.message});return; };
            if (!user) {
                callback({status:'error',message: 'Incorrect username'});
                if (params['user_remember_token']) {
                    delete params['user_remember_token'];
                    if (params['login'] && params['password']) {
                        me.socket_login(params);
                    }
                }
                return;
            };
            if (!params['user_remember_token'] && user.password != sha1(params.password)) {
                callback({status:'error',message: 'Incorrect password'});
                return;
            }
            var session = null;
            if (params.socket) {
                params.socket.session.user = user.guid;
                session = params.socket.session;
            };
            if (params.req) {
                params.req.session.user = user.guid;
                session = params.req.session;
            };
            var result = {status: 'ok', user: user.guid};
            if (!params['user_remember_token'] && params.remember_token) {
                result['remember_token'] = sha1(new Date().getTime()+user.guid);
                user.remember_token = result['remember_token'];
                user.record.remember_token = result['remember_token'];
                user.record.save();
            }
            Objects['WebServer'].sessionStore.set(Objects['WebServer'].sid,session, function() {
                callback(result);
            });

        });
    },

    onLoginSubmit: function(login,password,remember_token,callback) {
        Objects['WebServer'].sendMessage('login',{login:login,password:password,remember_token:remember_token},function(result) {
            if (result.remember_token) {
                Objects['Utils'].setCookie('remember_token', result.remember_token, 2592000, '/');
            }
            callback(result);
        });
    },

});
