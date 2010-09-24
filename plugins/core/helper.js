var helper=exports;
var plugin=helper.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
	this.testmessage();
}
plugin.prototype.testmessage=function()
{
	console.log("tast")
	this.plugins['messageParser'].message("help :me","help halp",function(result)
	{
		console.log(" "+result);
	})
}