// @if MODE='server'
    var util = require('util');
    var events = require('events');
    require("../../oop.js");
// @endif

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
        if (! (typeof window != 'undefined' && window.document)) {
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
            Objects['WebServer'].on('web_server_request', function(params) {
                var req = params.req;
                var url = params.req.url.split('/');
                url.shift();
                params.object = url.shift();
                params.action = url.shift();
                params.url = url; 
                me.onWebServerRequest(params);                
            });
        }
    },

    onWebServerRequest: function(params) {
        var me = this;
        if (params.object == me.guid.toLowerCase()) {
            if (me[params.req.method.toLowerCase()+'_'+params.action]) {                
                me[params.req.method.toLowerCase()+'_'+params.action](params);
            }
        }
    },
    
    show: function(template,res,params) {
        var me = this;
        params.template = template;
        params.guid = me.guid;
        res.render('layout',params);
    }
});
