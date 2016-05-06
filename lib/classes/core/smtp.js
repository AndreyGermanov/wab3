// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
var SMTPConnection = require('smtp-connection');
// @endif

Class.create('SMTP',Entity, {
    initialize: function($super,options) {
        $super(options);
        var me = this;
        if (me.isServer()) {
            me.config = require('../../../config/mail.js');
        }
    },

    send: function(to,subject,message,callback) {
        var me = this;
        me.conn = new SMTPConnection({
            host: me.config.client.host,
            port: me.config.client.port,
            secure: me.config.client.secure
        });
        me.conn.connect(function(err) {
                if (err) {
                    callback({status: 'error', message: err.message});
                    return;
                }
                me.conn.login({user:me.config.client.login,pass:me.config.client.password}, function(err) {
                   if (err) {
                       callback({status: 'error', message: err.message});
                       return;
                   }
                    message = "From: "+me.config.client.login+"\r\n"+"To: "+to+"\r\n"+"Subject: "+subject+"\r\n\r\n"+message+"\r\n";
                    me.conn.send({
                        from: me.config.client.login,
                        to: to
                    },message, function(err) {
                        if (err) {
                            callback({status: 'error', message: err.message});
                            return;
                        }
                        me.conn.quit();
                        callback({status: 'ok', message: 'Password reset link sent'});
                    })
                });
            }
        );
    }
});