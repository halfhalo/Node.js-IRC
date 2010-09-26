var core=exports;
var sys=require('sys');
require('underscore');
var plugin=core.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.routes={};
	this.prefix="!";
	this.name=name;
	this.folder=folder;
}
plugin.prototype.onMessage=function(obj)
{
	var self=this;
	_.each(self.routes,function(route){

		if(self.checkRoute(obj.message,route))
		{
			self.routeMessage(route,obj);
		}
	});
}
plugin.prototype.prefixExists=function(message)
{
	if(message[0]==this.prefix[0])
	{
		return message.substr(1,message.length);
	}
	if(message.substr(0,this.parent.nick.length)==this.parent.nick)
	{
		return message.substr(this.parent.nick.length+2,message.length)
	}
	return false;
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
plugin.prototype.getKeys=function(message)
{
	try{
		var keys=[];
		message=message.replace(/:(\w+)/g,function(key){
				keys.push(key.substr(1,key.length));
				return "(\\w+)";
		});
		return keys || [];
	}catch(e)
	{
		sys.puts(e)
	}
}
plugin.prototype.routeMessage=function(route,obj)
{
	var counter=1;
	var keys={};
	var self=this;
	try{
		if(self.prefixExists(obj.message))
			obj.message=self.prefixExists(obj.message);
		var items=obj.message.match(route.parser) || [];

		_.each(route.keys,function(item){
			keys[item]=items[counter];
			counter++;
		});
		route.callback(keys,obj,function(message,channel){
			self.parent.say(channel || obj.channel,message);
		})
	}catch(e)
	{
		sys.puts(e)
	}
}
plugin.prototype.toRegex=function(message)
{
	try{
		message=message.replace(/\./g, "\\.")
			.replace(/":(.*)"/g,function(key){
				return "\"([^\\s]*)\"";
		})
			.replace(/:(\w+)/g,function(_,key){
				return "([^\\s]+)";
		});
		var reg=new RegExp("^"+message+"$")
		return reg;
	}catch(e)
	{
		sys.puts(e)
	}

}
plugin.prototype.checkRoute=function(message,route)
{
	try{
		if(route.parser.test(message) || route.parser.test(this.prefixExists(message)))
		{
			return true;
		}
		else
		{
			return false;
		}
	}catch(e)
	{
		//sys.puts(e)
	}

}
plugin.prototype.in=function(route,callback)
{	


	if(typeof route=="string")
	{
		var obj={};


		obj.callback=callback;
		obj.keys=this.getKeys(route);
		obj.parser=this.toRegex(route);
		this.routes[route]=obj;
	}
	else if(typeof route=="object")
	{
		var self=this;
		_.each(route,function(r){
			var obj={};
			obj.callback=callback;
			obj.keys=self.getKeys(r);
			obj.parser=self.toRegex(r);
			self.routes[r]=obj;
		})
		
	}

}
