// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
var sha1 = require("sha1");
// @endif

Class.create('Model',Entity,{
    initialize: function($super,guid,options) {
        var me = this;
        $super(guid);
        
        if (me.isServer()) {
            me.config = require('../../../config/models/'+me.className.toLowerCase());
            
            if (!Objects['Db']) {
                require("../core/db.js");
                Class.new('Db','Db');
            }
            me.db_server = Objects['Db'];
            if (me.guid == me.className+'_factory') {
                me.collection = me.db_server.Waterline.Collection.extend(me.config.model);
                me.db_server.instance.loadCollection(me.collection);
            } else {
                me.collection = Objects[me.className+'_factory'];
            }
        }
        me.setListeners();
    },
    
    setListeners: function() {
        var me = this;
        if (me.isServer()) {
            me.db_server.on('database_loaded', function(result) {
                if (me.guid == me.className+'_factory') {
                    var ontology = result.ontology
                    me.collection = ontology.collections[me.config.model.identity];
                    me.emit('model_list_loaded',{list:me, local: true, server: true});
                }
            });
            if (Objects[me.className+'_factory']) {
                Objects[me.className+'_factory'].on('model_list_loaded', function(result) {
                    if (me.guid != me.className+'_factory') {
                        me.collection = result['list'].collection;
                    }
                });
            }            
        }
    },
    
    find: function(condition,callback) {
        me.collection.findOne().where(condition).then(function(result) {
            if (!Objects['User_'+result.id]) {
                var user = Class.new('User','User_'+result.id);
            } else {
                var user = Objects['User_'+result.id];
            };
            
            for (var i in result) {
                user[i] = result[i];
            };
            
            callback(null,user);
        }).catch(function(err) {
            callback(err);
        });        
    },
    
    findByGuid: function(id,callback) {
        if (Objects['User_'+id]) {
            callback(null,Objects['User_'+id]);
        } else {
            me.find({id:id},callback);
        }
    }
});
