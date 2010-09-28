var auth=exports;
var async=require('async')
require('underscore');
var mongoose=require('mongoose');
var plugin=auth.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.name=name;
	this.folder=folder;

	
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