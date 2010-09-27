var auth=exports;
var async=require('async')
require('underscore');
var dbH=require('./db/db.js');
var plugin=auth.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.name=name;
	this.folder=folder;
	this.users=new dbH.plugin("auth.db");
	this.users.new("users",{
		'username':'string',
		'password':'string',
		'global':'string',
		'channels':{
			'name':'string',
			'mode':'string'
		}
	},"username");
	this.users.new("onlineUsers",{
		'username':'string',
		'password':'string',
		'global':'string',
		'channels':{
			'name':'string',
			'mode':'string'
		}
	},"username");
	
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
plugin.prototype.allowed=function(user,channel,mode,allowed,callback)
{
	if(allowed.length==0 || allowed.indexOf(mode)!=-1)
	{
		callback(true);
	}
	else
	{
		callback(false);
	}
}
plugin.prototype.getHashedPass=function(pass)
{
	return pass;
}