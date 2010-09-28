var help=exports;
require('underscore');
//Initiate the plugin, recieving the name and folder the plugin is in.
var plugin=help.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins=[];
}
//Register the plugin with the system, 
plugin.prototype.registerPlugins=function(p,parent)
{
	this.plugins=p || {};
	//Sample routes.  Routes takes in an array of routes or a single string, a callback function that will contain the items that were matched in the route,
	//and a wrapper function to respond.  It optionally takes in an array of message types to match, and an array of permission levels to require.
	this.plugins['core'].in(["hello","hello!","hello :name","hello :name :channel"],function(items,obj,say){
		if(items.name)
		{
			say("hello "+items.name+"!");
		}
		else
		{
			say("hello!")
		}
	},['PRIVMSG']);
	this.plugins['core'].in(["blame","blame :channel"],function(items,obj,say){
		say("blames oil",items.channel || obj.channel);
	},['PRIVMSG'],["+"]);
}
