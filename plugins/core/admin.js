var admin=exports;
var plugin=admin.plugin=function(name,folder)
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
