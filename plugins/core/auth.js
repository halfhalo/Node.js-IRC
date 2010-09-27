var auth=exports;
var keys=require('keys');
var async=require('async')
require('underscore');
var plugin=auth.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.name=name;
	this.folder=folder;
	this.onlineUsers= new keys.Memory();
	this.users=new keys.nStore({'path':'users.db'})
	
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
plugin.prototype.allowed=function(user,channel,mode,allowed,callback)
{
	try{
		if(allowed.length==0 || allowed.indexOf(mode)!=-1)
		{
			callback(true)
		}
		else
		{
			this.getUser(user,function(users){
				if(users && users[0] && users[0].name)
				{
					if(allowed.indexOf(users[0].channels[channel])!=-1 || allowed.indexOf(users[0].global)!=-1)
					{
						callback(true);
					}
				}
				else
				{
					callback(false);
				}
			});
		}
	}catch(e)
	{
		console.log(e)
	}

}
plugin.prototype.login=function(name,pass,callback,uname)
{
	try{
		var self=this;
		this.getUser(name,function(users){
			if(users[1] && self.getHashedPass(users[1].pass)==self.getHashedPass(pass))
			{
				self.onlineUsers.set(uname || name,users[1]);
				callback(true);
			}
			else
			{
				callback(false);
			}
		})
	}catch(e)
	{
		console.log(e)
		return false;
	}
}
plugin.prototype.register=function(name,password,callback)
{
	try{
		var self=this;
		this.getUser(name,function(users){

			if(!users[1].name)
			{
				var obj={};
				obj.name=name;
				obj.pass=self.getHashedPass(password);
				obj.channels={};
				obj.global="";
				self.users.set(name,JSON.stringify(obj));
				callback(true);
			}
			else
			{
				callback(false);
			}
		})
	}catch(e)
	{
		console.log(e)
	}

}
plugin.prototype.global=function(user,callback,uname)
{
	var self=this;
	this.getUsers(name,function(users){
		if(users[1] && users[1].name)
		{
			users[1].global="*";
			self.users.set(uname || users[1].name,users[1]);
			callback(true);
		}
	});
}
plugin.prototype.getUser=function(name,callbok)
{
	var self=this;
	async.series([
		function(callback)
		{
			self.onlineUsers.has(name,function(err,exists){
				if(exists)
				{
					self.onlineUsers.get(name,function(err,key){
						try{
							var obj=JSON.parse(key);
							callback(null,obj);
						}catch(e)
						{
							callback(null,{});
						}
					});
				}
				else
				{
					callback(null,{});
				}
			})
		},
		function(callback)
		{
			self.users.has(name,function(err,exists){
				if(exists)
				{
					self.users.get(name,function(err,key){
						try{
							var obj=JSON.parse(key);
							callback(null,obj);
						}catch(e)
						{
							callback(null,{});
						}
					});
				}
				else
				{
					callback(null,{});
				}
			})
		}
		],function(err,items){
			callbok(items);
		})
}
plugin.prototype.getHashedPass=function(pass)
{
	return pass;
}