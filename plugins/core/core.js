var core=exports;
var sys=require('sys');
var _=require('underscore');
var plugin=core.plugin=function(parent,manager)
{
	this.plugins={};
	this.manager=manager;
	this.parent={};
	this.routes=[];
	this.prefix="!";
}
plugin.prototype.onData=function(data)
{
	this.routeMessage(data)
}
plugin.prototype.routeMessage=function(obj)
{
	var self=this;
	_.each(self.routes,function(route){
		if(self.checkRoute(obj,route))
			self.runRoute(obj,route);
	});
}
//Check if route is allowed to proceeds
plugin.prototype.checkRoute=function(obj,route)
{
	try{
		if(( route.route.test(obj.message) || route.route.test(this.prefixExists(obj.message)) ) && this.manager.core.auth.allowed(route.allowed) )
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
plugin.prototype.runRoute=function(obj,route)
{
	
}
plugin.prototype.on=function(route,callback,options)
{
	var obj={};
	obj.name=route;
	
	obj.route=this.toRegex(route);
	obj.keys=this.toKeys(route);
	obj.callback=callback;
	if(options)
	{
		obj.types=options.messages || [];
		obj.allowed=options.allowed || [" "];
		obj.controller=options.controller || "";
	}
	else
	{
		obj.types=[];
		obj.allowed=[" "];
		obj.controller="";
	}

	this.routes.push(obj);
	console.log(this.routes)
}
plugin.prototype.raw=function()
{
	
}
//Convert Recieved Route to Regex
plugin.prototype.toRegex=function(message)
{
	try{
		message=message.replace(/\./g, "\\.")
			.replace(/:\$(\w+)/g,function(key){
				return "([0-9]+)";
			})
			.replace(/":(.*)"/g,function(key){
				return "\"(.*)\"";
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
//Get Keys From Route
plugin.prototype.toKeys=function(message)
{
	var keys=[];
	try{
		message=message.replace(/\./g, "\\.")
			.replace(/:\$(\w+)/g,function(key){
				keys.push(key.substr(2,key.length));
				return ""
			})
			.replace(/":(.*)"/g,function(key){
				keys.push(key.substr(2,key.length-3));
				return "\"(.*)\"";
		})
			.replace(/:(\w+)/g,function(key){
				keys.push(key.substr(1,key.length));
				return "([^\\s]+)";
		});
		
		return keys;
	}catch(e)
	{
		//sys.puts(e)
	}

}
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
