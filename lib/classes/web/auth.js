// @if MODE='server'
require("../../oop.js");
require("../core/entity.js");
require("../core/smtp.js");
var validator = require('validator');
var sha1 = require('sha1');
var crypto = require('crypto');
var ip = require('ip');
// @endif

Class.create('Auth',Entity,{
    initialize: function($super,options) {
        $super(options);
        var me = this;
        if (me.isServer()) {
            me.config = require('../../../config/auth.js');
            me.web_server = Objects['WebServer'];
            me.configure();
            me.setListeners();
        }
    },
    
    configure: function() {
        var me = this;

        if (!Objects['User_factory']) {
            require("../models/user.js");
            Class.new('User','User_factory');
        }
    },
    
    authenticate: function(type, req,callback) {
        var me = this;
        if (type=='http') {
            var url = req.url.split('/');
            if (url.length>=3) {
                url = url[0]+'/'+url[1]+'/'+url[2];
            }
            console.log(url);
            if (me.config.public_routes.indexOf(url) != -1 || req.session.user) {
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
            if (me.config.public_websocket_events.indexOf(req.event) != -1 || req.session.user) {
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

    get_reset: function(params) {
        var me = this;
        me.show('resetPassword',params.res,{});
    },

    socket_login: function(params) {
        var me = this;
        var callback = params.callback;
        var condition = {login: params.login};
        if (params['user_remember_token']) {
            condition = {remember_token: params['user_remember_token']};
        }
        Objects['User_factory'].find(condition, function(err, user) {
            if (err) { throw(err);callback({status:'error',message: err.message});return; };
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

    socket_getResetPasswordLink: function(params) {
        var me = this,
            email = params.email,
            callback = params.callback;
        if (!validator.isEmail(email)) {
            callback({status:'error',message:'Email address is incorrect'});
            return;
        };
        Objects['User_factory'].find({login:email}, function(err, user) {
            if (err) {
                callback({status:'error',message:err.message});
                return;
            }
            if (!user) {
                callback({status:'error',message:'User with specified email address not found'});
                return;
            }
            var cipher = crypto.createCipher('aes-128-ctr', me.config.salt);
            var encrypted = cipher.update(user.login+'/'+user.password,'utf8','base64');
            process.nextTick(function() {
                encrypted += cipher.final('base64');
                var link = 'http://'+ip.address()+'/auth/resetPassword/'+encrypted;

                if (!Objects['SMTP']) {
                    Class.new('SMTP','SMTP');
                };
                Objects['SMTP'].send(email,'Password reset link',link,function(result) {
                    callback(result);
                })
            })
        });
    },

    checkResetPasswordLink: function(link,callback) {
        var me = this;
        var cipher = crypto.createDecipher('aes-128-ctr', me.config.salt);
        link = cipher.update(link,'base64','utf8');
        process.nextTick(function() {
            link += cipher.final('utf8');
            if (link && link.split('/').length == 2) {
                link = link.split('/');
                var login = link[0];
                var password = link[1]
                Objects['User_factory'].find({login:login,password:password},function(err,user) {
                    if (err || !user) {
                        callback({status:'error',message:'Incorrect link'});
                        return;
                    } else {
                        callback({status:'ok',user:user,link:link})
                    }
                })
            } else {
                callback({status:'error',message:'Incorrect link'});
            }
        });
    },

    get_resetPassword: function(params) {
        var me = this;
        var link = params.url.join('/');
        me.checkResetPasswordLink(link, function(result) {
            if (result.status == 'error') {
                params.res.end(result.message);
                return;
            } else {
                params.properties = {};
                params.properties.link = '"'+link+'"';
                me.show('resetPasswordForm',params.res,params);
            }
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

    onResetPasswordSubmit: function(email,callback) {
        Objects['WebServer'].sendMessage('getResetPasswordLink',{email:email},function(result) {
            callback(result);
        });
    },

    socket_resetPassword: function(params) {
        var me = this,
            password = params.password,
            confirm_password = params.confirm_password,
            link = params.link,
            callback = params.callback;
        var result = me.validateForm(
            {
                error: false,
                error_message: '',
                formControls: {
                    'password': {
                        inputClassName: '',
                        errorMessageClassName: 'hidden',
                        errorMessage: '',
                        value: password
                    },
                    'confirm_password': {
                        inputClassName: '',
                        errorMessageClassName: 'hidden',
                        errorMessage: '',
                        value: confirm_password
                    }
                }
            }
        );
        if (result.error) {
            callback(result);
        } else {
            me.checkResetPasswordLink(link, function(out) {
                if (out.status == 'error') {
                    result.error = true;
                    result.error_message = out.message;
                    callback(result);
                } else {
                    var user = out.user;
                    user.record.password = sha1(password);
                    user.record.save();
                    callback({status:'ok',message:'Password updated successfully'});
                }
            })
        }

    },

    onNewPasswordSubmit: function(password,confirm_password,link,callback) {
        Objects['WebServer'].sendMessage('resetPassword', {password:password,confirm_password:confirm_password,link:link}, function(result) {
            callback(result);
        });
    },

    validateFormItem: function(id,value,template) {
        var error = {className: '',errorMessageClassName:'hidden',errorMessage:'',value:value};
        if (template == 'resetPassword') {
            if (id == 'email') {
                if (!validator.isEmail(value)) {
                    error = {inputClassName:'error',errorMessageClassName:'error',errorMessage:'Email address is incorrect',value:value}
                }
            }
        }
        if (template == 'resetPasswordForm') {
            if (id == 'password' || id == 'confirm_password') {
                if (!value) {
                    error = {inputClassName:'error',errorMessageClassName:'error',errorMessage:'Value not entered',value:value}
                }
            }
        }
        return error;
    },

    validateForm: function($super,form,template) {
        var result = $super(form,template);
        if (result.error) {
            return result;
        } else {
            if (template == 'resetPasswordForm') {
                if (form.password.value != form.confirm_password.value) {
                    result.error = true;
                    result.error_message = 'Passwords should match';
                }
            }
        }
        return result;
    }
});
