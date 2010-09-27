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
}
