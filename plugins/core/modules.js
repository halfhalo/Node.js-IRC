var mod=exports;
require('underscore');
var plugin=mod.plugin=function(name,folder)
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
	var self=this;
	this.plugins['messageParser'].addRoute(this.name,"modules",function(result,obj)
	{
		self.parent.say(obj.channel,"Loaded Modules: ");
		_.each(self.plugins,function(plugin,name){
			self.parent.say(obj.channel,name+" from ("+plugin.folder+")");
		})
		
	});
}	
plugin.prototype.onMessage=function(obj)
{
	this.plugins['messageParser'].message(this.name,obj.message,obj);
}