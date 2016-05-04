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
    
    authenticate: function(req,callback) {
        if (req.url.search('/auth/login')!=-1 || req.session.user) {
            callback();
        } else {
            callback(true);
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

    post_login: function(params) {
        var req = params.req,
            res = params.res;
        Objects['User_factory'].find({login: req.body.login}, function(err, user) {
            if (err) { res.json(err.message) };
            if (!user) {
                res.json({message: 'Incorrect username'});
                return;
            };
            if (user.password != sha1(req.body.password)) {
                res.json({message: 'Incorrect password'});
                return;
            }
            req.session.user = user.guid;
            res.end(user.guid);
        });
    },

    onLoginSubmit: function(login,password,callback) {
        $.post('/auth/login',{login:login,password:password},function(data) {
            callback(data);
        });
    },

});
