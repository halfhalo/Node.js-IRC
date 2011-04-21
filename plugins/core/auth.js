var auth=exports;
var sys=require('sys');
var _=require('underscore');
var plugin=auth.plugin=function(parent,manager)
{
	this.manager=manager;
	this.parent={};
	
}
plugin.prototype.allowed=function(allowed, username, mode)
{
	return true;
}
