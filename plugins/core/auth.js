var auth=exports;
var plugin=auth.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
plugin.prototype.authUser=function(user,channel,action)
{
	return true;
}
plugin.prototype.addUser=function(user,channel,action)
{
	return true;
}
plugin.prototype.removeUser=function(user,channel,action)
{
	return true;
}