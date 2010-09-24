var hello=exports;
var plugin=hello.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins={};
	this.parent={};
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
	var self=this;
	this.plugins['messageParser'].addRoute(this.name,"hello",function(result,obj)
	{
		self.parent.say(obj.channel,"Hello!");
	});
}
plugin.prototype.onMessage=function(obj)
{
	this.plugins['messageParser'].message(this.name,obj.message,obj);
}