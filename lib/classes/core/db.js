// @if MODE='server'
require("../../oop.js");
require("./entity.js");
var fs = require('fs');
var sha1 = require('sha1');
var async = require('async');
// @endif

Class.create('Db',Entity,{
    initialize: function($super,guid) {
        $super(guid);
        var me = this;
        if (me.isServer()) {
            me.config = require('../../../config/db.js');
            me.Waterline = require('waterline');
            me.instance = new me.Waterline();
            async.waterfall([
                function(callback) {
                    fs.readdir(__dirname+'/../models/', function(err,files) {
                        if (err) {
                            callback(err);
                        }
                        callback(null,files);
                    })
                },
                function(files,callback) {
                    async.eachSeries(files, function(file,each_callback) {
                        require('../models/'+file);
                        each_callback();
                    },function(err) {callback()});
                },
                function(callback) {
                    me.instance.initialize(me.config,function(err,ontology) {
                        if (!err) {
                            me.emit('database_loaded',{local_event: true, server_event: true, ontology: ontology});
                            callback();
                        } else {
                            callback(err);
                        }
                    });                    
                }
            ],function(err, result) {
                if (err) {
                    throw(err);
                }
            });
            
        }
    }
});
