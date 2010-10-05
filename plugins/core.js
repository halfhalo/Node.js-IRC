var core=exports;
var sys=require('sys');
require('underscore');
var plugin=core.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.routes=[];
	this.prefix="!";
	this.name=name;
	this.folder=folder;
	this.rawOutput=[];
}
plugin.prototype.onMessage=function(obj)
{
	var self=this;
	//Send the raw output to each plugin that wants it.
	_.each(self.rawOutput,function(cb){
	cb(obj);
	});
	//run through each route and see if it matches.
	_.each(self.routes,function(route){

		if(self.checkRoute(obj,route))
		{
		//check if the user is allowed to use that route.
			self.plugins['auth'].allowed(obj.name,obj.channel,obj.mode || " ",route.level,function(s){

				if(s)
					self.routeMessage(route,obj);
			})

			
		}
	});
}
//Check if the prefix that is set is found in the message or if the bots name is found as well
plugin.prototype.prefixExists=function(message)
{
	try{
		if(message[0]==this.prefix[0])
		{
			return message.substr(1,message.length);
		}
		if(message.substr(0,this.parent.nick.length)==this.parent.nick)
		{
			return message.substr(this.parent.nick.length+2,message.length)
		}
		return false;
	}catch(e)
	{
		
	}

}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
//Parse the regex to find the keys that match up with the variables
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
		//sys.puts(e)
	}
}
//Route the message to the correct plugin
plugin.prototype.routeMessage=function(route,obj)
{
	var counter=1;
	var keys={};
	var self=this;

	try{
		if(self.prefixExists(obj.message))
		{
			obj.message=self.prefixExists(obj.message);
		}
			
		var items=obj.message.match(route.parser) || [];

		_.each(route.keys,function(item){
			keys[item]=items[counter];
			counter++;
		});
		route.callback(keys,obj,function(message,channel){
			try{
				if(obj.isChannel)
				{
					self.parent.say(channel || obj.channel,message);	
				}
				else
				{
					self.parent.say(channel || obj.name,message);
				}
			}catch(e)
			{

			}

			
		})
	}catch(e)
	{
		sys.puts(e)
		//console.log(e)
	}
}
//Create reges from the route
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
		//sys.puts(e)
	}

}
//Check the route to see if it matches
plugin.prototype.checkRoute=function(obj,route)
{
	try{
		if((route.parser.test(obj.message) || route.parser.test(this.prefixExists(obj.message))) && (route && route.allowedTypes &&(route.allowedTypes.length==0 || route.allowedTypes.indexOf(obj.type)!=-1)))
		{
			return true;
		}
		else
		{
			return false;
		}
	}catch(e)
	{
		sys.puts(e)
	}

}
//Take in the route and set everything up.
plugin.prototype.in=function(route,callback,allowedTypes,requiredLevel)
{	
	try{
		if(typeof route=="string")
		{
			var obj={};


			obj.callback=callback;
			obj.keys=this.getKeys(route);
			obj.parser=this.toRegex(route);
			obj.allowedTypes=allowedTypes || [];
			obj.level=this.getLevels(requiredLevel);
			obj.name=route;
			this.routes.push(obj);
		}
		else if(typeof route=="object")
		{
			var self=this;
			_.each(route,function(r){
				var obj={};
				obj.callback=callback;
				obj.keys=self.getKeys(r);
				obj.parser=self.toRegex(r);
				obj.allowedTypes=allowedTypes || [];
				obj.level=self.getLevels(requiredLevel);
				obj.name=route;
				self.routes.push(obj);
			})

		}
	}catch(e)
	{
		sys.puts(e)
	}

}
//Get the levels that are allowed for the route
plugin.prototype.getLevels=function(allowed)
{
	if(!allowed || allowed.length==0)
		return [];
	
		if(allowed.indexOf("*")==-1)
		{
			allowed.push("*");
			if(allowed.indexOf("@")==-1)
			{
				allowed.push("@");
				if(allowed.indexOf("+")==-1)
				{
					allowed.push("+");
					if(allowed.indexOf(" ")==-1)
					{
						allowed.push(" ");
					}
				}
			}
		}
	return allowed;
}
plugin.prototype.enterChannel=function(channel)
{
	this.parent.enterChannel(channel);
}
plugin.prototype.leaveChannel=function(channel)
{
	this.parent.leaveChannel(channel);
}
plugin.prototype.sendMessage=function(message,channel)
{

}
plugin.prototype.listenRaw=function(callback)
{
	this.rawOutput.push(callback)
}
