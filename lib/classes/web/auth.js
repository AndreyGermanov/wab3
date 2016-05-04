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

        me.passport = require('passport');
        me.localStrategy = require('passport-local').Strategy;
                
        me.passport.serializeUser(function(user,done) {
            done(null,user.guid);
        });
        
        me.passport.use(new me.localStrategy(
            function(username, password, done) {
                User.find({username: username}, function(err, user) {
                    if (err) { return done(err) };
                    if (!user) {
                        return done(null, false, {message: 'Incorrect username'});
                    };
                    if (user.password != sha1(password)) {
                        return done(null, false, {message: 'Incorrect password'});
                    }
                    return done(null,user);
                });
            }
        ));
        
        me.passport.deserializeUser(function(id,done) {
            Objects['User_factory'].findByGuid(id, function(err,user) {
                done(err,user);
            });
        });
        
        me.web_server.app.use(me.passport.initialize());
        me.web_server.app.use(me.passport.session());        
    },
    
    authenticate: function(req,callback) {
        if (req.url.search('/auth/login')!=-1 || req.isAuthenticated()) {
            callback();
        } else {
            callback(true);
        }
    },
    
    get_login: function(params) {
        var me = this;
        me.show('login',params.res,{});
    },

    onLoginSubmit: function(login,password,callback) {
        if (callback) {
            callback();
        }
    },

});
