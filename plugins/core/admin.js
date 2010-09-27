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
	this.plugins['core'].in("register :user :pass",function(items,obj,say){
		self.plugins['auth'].register(items.user,items.pass,function(res){
				if(res)
				{
					say("Thank you for registering!");
				}
				else
				{
					say("There was an issue with your registration")
				}
		})
	},['PRIVMSG']);
	this.plugins['core'].in("login :user :pass",function(items,obj,say){
		self.plugins['auth'].login(items.user,items.pass,function(res){
				if(res)
				{
					say("Now logged in as halfhalo");
				}
				else
				{
					say("Error logging in...")
				}
		},obj.name)
	},['PRIVMSG']);
	this.plugins['core'].in("admin global :user ",function(items,obj,say){
		self.plugins['auth'].login(items.user,function(res){
				if(res)
				{
					say(items.user+" is now a global admin");
				}
				else
				{
					say("Could not set "+items.user+" as global admin!")
				}
		},obj.name)
	},['PRIVMSG']);
}
