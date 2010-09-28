var admin=exports;
require('underscore');
var plugin=admin.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins=[];
}
plugin.prototype.registerPlugins=function(p,parent)
{
	this.plugins=p || {};
	var self=this;
	this.plugins['core'].in(["register :username :password :name :email"],function(items,obj,say){
		self.plugins['auth'].register(items,function(res,err){
			say(err)
		})
	},['PRIVMSG']);
	this.plugins['core'].in(["login :username :password"],function(items,obj,say){
		self.plugins['auth'].login(items.username,items.password,function(res,err){
			say(err)
		})
	},['PRIVMSG']);
}
