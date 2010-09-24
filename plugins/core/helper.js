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

}
