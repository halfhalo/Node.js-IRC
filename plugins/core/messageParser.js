var parser=exports;
require('underscore');
var plugin=parser.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.routes={};
	this.prefix="!";
}
plugin.prototype.onMessage=function(obj)
{
//Placeholder since no message should ever be invoked here...	
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
plugin.prototype.addRoute=function(plugin,parser,callback,prefix)
{
	if(!this.routes[plugin])
	{
		this.routes[plugin]=[];
	}
	var obj={};
	obj.parser=this.toRegex(parser);
	obj.keys=this.getKeys(parser);
	obj.callback=callback;
	obj.prefix=prefix || true;
	this.routes[plugin].push(obj);
	return true;
}
plugin.prototype.checkRoute=function(route,message,obj)
{
	if(route.prefix)
	{
		var msg=this.prefixExists(message);
		if(msg!=false)
		{
			if(route.parser.test(msg))
			{
				var tmp=msg.match(route.parser);
				var counter=1;
				var keys={};
				_.each(route.keys,function(key){
					try{
						keys[key]=tmp[counter];
						counter++;
					}catch(e)
					{

					}

				});

				route.callback(keys,obj);
			}
		}
	}
	else
	{
		if(route.parser.test(message))
		{
			var tmp=message.match(route.parser);
			var counter=1;
			var keys={};
			_.each(route.keys,function(key){
				try{
					keys[key]=tmp[counter];
					counter++;
				}catch(e)
				{

				}

			});
			route.callback(keys,obj);
		}
	}

}
plugin.prototype.message=function(plugin,message,obj)
{
	if(this.routes[plugin])
	{
		
		var self=this;
		var breakers=false;
		_.each(this.routes[plugin],function(route){
			if(!breakers)
			{
				var result=self.checkRoute(route,message,obj);
			}
		});
	}
}
plugin.prototype.getKeys=function(message)
{
	var keys=[];
	message=message.replace(/:(\w+)/g,function(key){
			keys.push(key.substr(1,key.length));
			return "(\\w+)";
	});
	return keys;
}
plugin.prototype.toRegex=function(message)
{
	message=message.replace(/\./g, "\\.")
		.replace(/:(\w+)/g,function(_,key){
			return "(\\w+)";
	});
	var reg=new RegExp("^"+message+"$")
	return reg;
}