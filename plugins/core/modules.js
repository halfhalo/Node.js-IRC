var modules=exports;
require('underscore');
var plugin=modules.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins=[];
}
plugin.prototype.registerPlugins=function(p,parent)
{
	this.plugins=p || {};
	var self=this;
	this.plugins['core'].in("module load :modname",function(items,obj,say){
		console.log(items)
	},['PRIVMSG'],["@"]);
}
plugin.prototype.loadModule=function(channel,module)
{
	
}