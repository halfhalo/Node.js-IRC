var auth=exports;
var async=require('async')
require('underscore');
require('joose')
require('joosex-namespace-depended')
require('hash')
var mongoose=require('mongoose').Mongoose;
var plugin=auth.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
	this.name=name;
	this.folder=folder;
	this.onlineUsers={};
	try{
		this.db=mongoose.connect('mongodb://silentbluesystems.com/node-irc');
		
		mongoose.model('User', {

		    properties: ['username', 'realname','email', 'password', 'global',{channels:[['name','level']]},{permissions:[['name','method','level']]}],

		    cast: {
		      username: String,
			  channels:{
				name: String,
				level: String
				},
			  permissions: {
				name: String,
				method: String,
				level: String
			}
			
		    },

		    indexes: ['username'],

		    setters: {

		    },

		    getters: {
//		        full_name: function(){ 
//		            return this.first + ' ' + this.last 
//		        }
		    },

		    methods: {
		        save: function(fn){
		            this.updated_at = new Date();
					this.password=Hash.md5(this.password);
		            this.__super__(fn);
		        }
		    },

		    static: {
//		        findByUsername: function(){
//		            return this.find();
//		        }
		    }

		});
		this.User= this.db.model('User');
		
	}catch(e)
	{
		console.log(e)
	}

	
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
plugin.prototype.allowed=function(user,channel,mode,allowed,callback)
{
	if(allowed.length==0 || allowed.indexOf(mode)!=-1 || (this.onlineUsers[user] && (allowed.indexOf(this.onlineUsers[user].global)!=-1 || allowed.indexOf(this.onlineUsers[user].channels[channel].mode)!=-1)))
	{
		callback(true);
	}
	else
	{
		callback(false);
	}
}
plugin.prototype.addOnlineUser=function(user)
{
	this.onlineUsers[user.username]=user;
	return true;
}
plugin.prototype.setChannelMode=function(user,channel,mode)
{
	if(!this.onlineUsers[user])
	{
		var obj={}
		obj.username=user;
		obj.channels=[];
		obj.permissions=[];
		obj.global="";
		this.addOnlineUser(obj)
	}
	if(!this.onlineUsers[user].channels[channel])
	{
		this.onlineUsers[user].channels[channel]={};
		this.onlineUsers[user].channels[channel].name=channel;
	}
		this.onlineUsers[user].channels[channel].mode=mode;
	return true;
	
}
plugin.prototype.login=function(user,pass,callback)
{
	var self=this;
	this.User.find({username:user,password:Hash.md5(pass)}).all(function(arr){
		if(arr && arr.length==1)
		{
			var u=arr[0];
			u.channels={};
			u.permissions={};
			//console.log(u)
			_.each(arr[0].channels,function(channel){
				u.channels[channel.name]={}
				u.channels[channel.name].name=channel.name
				u.channels[channel.name].mode=channel.mode
			})
			_.each(arr[0].permissions,function(channel){
				u.permissions[channel.name]={}
				u.permissions[channel.name].name=channel.name
				u.permissions[channel.name].method=channel.method
				u.permissions[channel.name].mode=channel.mode
			})
			self.addOnlineUser(u);
			callback(true,"User Logged In")
		}
		else
		{
			callback(false,"User Not Found")
		}
	})
}
plugin.prototype.register=function(obj,callback)
{
	if(obj.username && obj.password && obj.name && obj.email)
	{
		var u=new this.User();
		u.username=obj.username;
		u.password=obj.password;
		u.realname=obj.name;
		u.global="";
		u.email=obj.email;

		this.User.find({username: obj.username}).one(function(array){
			if(!array || array.length<1)
			{
				u.save();
				callback(true,"Thank you for registering!")
			}
			else
			{
				callback(false,"User has already registered!")
			}
		})
		//u.save();
	}
	else
	{
		callback(false,"Missing required data...")
	}
	
	
	
}
plugin.prototype.getHashedPass=function(pass)
{
	return pass;
}