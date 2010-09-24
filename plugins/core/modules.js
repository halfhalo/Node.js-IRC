var mod=exports;
var plugin=mod.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}