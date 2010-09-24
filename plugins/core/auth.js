var auth=exports;
var plugin=auth.plugin=function(options)
{
	//var db=options.db || [];
	console.log('Auth Plugin Registered')
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