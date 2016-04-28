require("../../oop.js");
require("../core/entity.js");

Class.create('Auth',Entity,{
    initialize: function($super,guid) {
        $super(guid);
        var me = this;
        if (me.isServer()) {
            me.web_server = Objects['WebServer'];
            me.config();
        }
    },
    config: function() {
        var me = this;
        me.passport = require('passport');
        me.localStrategy = require('passport-local').Strategy;
        
        me.passport.serializeUser(function(user,done) {
            done(null,user.guid);
        });
        
        me.passport.deserializeUser(function(id,done) {
            if (!Objects['User_factory']) {
                require("../models/user.js");
                Class.new('User','User_factory');
            }
            Objects['User_factory'].findByGuid(id, function(err,user) {
                done(err,user);
            });
        });
        
        me.web_server.app.use(me.passport.initialize());
        me.web_server.app.use(me.passport.session());        
    },
    authenticate: function(req,callback) {
        callback();         
    }
});
