// @if MODE='server'
var ip = require('ip');
require("../../oop.js");
// @endif
Class.create('Utils',Entity, {
    setCookie: function(name,value,expires,path,domain,secure) {
        expires instanceof Date ? expires = expires.toGMTString() : typeof(expires) == 'number' && (expires = (new Date(+(new Date) + expires * 1e3)).toGMTString());
        var r = [name + "=" + escape(value)], s, i;
        for(i in s = {expires: expires, path: path, domain: domain}){
            s[i] && r.push(i + "=" + s[i]);
        }
        return secure && r.push("secure"), document.cookie = r.join(";"), true;
    }
});
Class.new('Utils','Utils');
