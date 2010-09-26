var help=exports;
require('underscore');
var plugin=help.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins=[];
}
plugin.prototype.registerPlugins=function(p,parent)
{
	this.plugins=p || {};
	this.plugins['core'].in(["hello","hello!","hello :name","hello :name :channel"],function(items,obj,say){
		if(items.name)
		{
			say("hello "+items.name+"!");
		}
		else
		{
			say("hello!")
		}
	});
}
