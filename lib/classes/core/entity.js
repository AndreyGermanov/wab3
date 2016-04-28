if ('undefined' != typeof(module) && null != module) {
    var util = require('util');
    var events = require('events');
}

require("../../oop.js");

Class.create('Entity',{
    
    initialize: function(options) {
        var me = this;       
        
        me.className = options['className'];
        if (options['guid']) {
            me.guid = options['guid'];
            me.created_guid = options['guid'];
            Objects[options['guid']] = me;
        }
        me.listeners = {};
        if ('undefined' != typeof(module) && null != module) {
            events.EventEmitter.call(this);
            for (var methodName in events.EventEmitter.prototype) {
                this[methodName] = events.EventEmitter.prototype[methodName];
            }
            //util.inherits(this,events.EventEmitter);
        }
    },
    
    getFields: function() {
        var result = {};
        for (var i in this) {
            if (typeof(this[i])!='function' && typeof(this[i])!='object') {
                result[i] = this[i];
            }
        }
        return result;
    },
    
    emit: function(event,options) {
        if (!this.isServer()) {
            for (var i in Objects) {
                var obj = Objects[i];
                if (obj.listeners[event] && obj.listeners[event].length) {
                    for (var o in obj.listeners[event]) {                   
                        obj.listeners[event][o](options);
                    }
                }
            }        
        }
    },
    
    on: function(event,func) {
        var me = this;
        if (!this.isServer()) {
            if (!me.listeners[event]) {
                me.listeners[event] = [];
            }
            me.listeners[event].push(func);
        }
    },

    once: function(event,func) {
        var me = this;
        me.on(event,func);
    },

    isServer: function() {
        return ! (typeof window != 'undefined' && window.document);
    },

    serialize: function(fields) {
        var me = this,
            all_fields = me.getFields(),
            result = {};
        if (fields.length) {
            for (var i in fields) {
                if (all_fields[fields[i]]) {
                    result[i] = all_fields[fields[i]]
                }
            }
            return JSON.stringify(result);
        } else {
            return JSON.stringify(all_fields);
        }
    },        
    
    setListeners: function() {
        var me = this;
        if (me.isServer()) {
            me.on('web_server_request', function(params) {
                me.onWebServerRequest(params);                
            });
        }
    },
    
    onWebServerRequest: function(params) {
        var me = this;        
        var res = params.res;
        res.end(params.req.url);
    }
});


if ('undefined' != typeof(module) && null != module) {
    module.exports = Entity;
}
