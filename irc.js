var sys=require('sys');
var net=require('net');
var crypto = require('crypto');
require('underscore');
var dns = require('dns');
var fs=require('fs');
var irc = exports;
function bind(fn, scope) {
  var bindArgs = Array.prototype.slice.call(arguments);
  bindArgs.shift();
  bindArgs.shift();

  return function() {
    var args = Array.prototype.slice.call(arguments);
    fn.apply(scope, bindArgs.concat(args));
  };
}
var server=irc.server=function(params){
	this.connection=null;
	this.host=params.host || null;
	this.port=params.port || null;
	this.ssl=params.ssl || null;
	this.timeout=10*60;
	this.outBuffer='';
	this.buffer='';
	this.ping=params.ping || false;
	this.encoding='utf8';
	this.channels={};
	this.plugins={};
	this.nick=params.nick;
	self=this;
	//Register The Plugins
	this.registerPlugins();
}
sys.inherits(server, process.EventEmitter);
server.prototype.connect=function(params)
{

	var connection=net.createConnection(this.port,this.host);
	connection.setEncoding(this.encoding);
	connection.setTimeout(this.timeout);
	connection.setKeepAlive(enable=true,10000);
	if(this.ssl)
		connection.setSecure(crypto.createCredentials(this.ssl));
	connection.addListener('connect',function(){
		self.onConnect(params);
	});
	connection.addListener('secure',function(){
		self.onSecureConnect(params);
	});
	connection.addListener('data',function(data){
		self.onData(data);
	});
	connection.addListener('error',function(error){
		console.log(error)
		//self.onError(error);
	});
	connection.addListener('end',function(){
		self.onDisconnect(params);
	});
	this.connection=connection;
}
server.prototype.onConnect=function(params)
{
	this.send('NICK', params.nick);
	this.nick=params.nick;
	if(params.pass)
		this.send('PASS',params.pass)
  	this.send('USER', params.user, '0', '*', ':'+params.real);
	this.emitInfo("Established Connection");
	this.emit("connect");
}
server.prototype.onDisconnect=function()
{
	this.emitInfo("Connection Terminated");
	this.emit("end");
}
server.prototype.onData=function(data)
{
	
	this.buffer=this.buffer+data;

	while (this.buffer) {
	    	var offset = this.buffer.indexOf("\r\n");
	    	if (offset < 0) {
	     	return;
		}
		var message = this.buffer.substr(0, offset);
		this.buffer = this.buffer.substr(offset + 2);
		if(message.match(/(?:(:[^\s]+) )?([^\s]+) (.+)/))
		{	
			var match=message.match(/(?:(:[^\s]+) )?([^\s]+) (.+)/);
			var params=match[3].match(/(.*?) ?:(.*)/) || null;
			switch(match[2])
			{
				default:
					this.emitInfo(message);
				break;
				case 'JOIN':
					this.onJoin(match,params);
				break;
				case 'PART':
					this.onPart(match,params);
				break;
				case 'QUIT':
					this.onQuit(match,params);
				break;
				case 'PRIVMSG':
					this.onPrivateMessage(match,params);
				break;
				case 'NOTICE':
					this.onNotice(match,params);
				break;
				case '353':
					this.onUserList(match,params);
				break;
				case 'MODE':
					this.onMode(match,params);
				break;
				case 'NICK':
					this.onNick(match,params);
				break;
				case 'PING':
					this.onPing();
				break;
				case '333':
					this.onChannelMaker(match,params);
				break;
				case '001':
				case '002':
				case '003':
				case '250':
				case '251':
				case '255':
				//case '265':
				//case '266':
				case '303':
				case '315':
				case '332':
				case '366':
				case '372':
				case '375':
				case '376':
				this.onNumerical(match,params);
				break;
				case 'PONG':
				break;
			}
		}
	}
}
server.prototype.onChannelMaker=function(match,params)
{
	//console.log(this.getUserNameOrServerName(match[0]))
	//console.log(params);
	//console.log(match[3].match(/([^\s]+)\s(.*)/));
}
server.prototype.onNick=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.nick=match[3].substring(1,match[3].length);
	this.output(obj);
}
server.prototype.onJoin=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	
	obj.channel=params[2];
	this.output(obj);
	self.addUser(obj.channel,obj.name);
}
server.prototype.onPart=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	if(params)
	{
		obj.channel=params[1];
		obj.message=params[2];
	}
	else
	{
		obj.channel=match[3];
	}
	
	this.output(obj);
	this.removeUser(obj.channel,obj.name)
}
server.prototype.onQuit=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.message=match[3].substring(1,match[3].length);
	var channels=this.getUserChannels(obj.name)
	_.each(channels,function(channel){
		obj.channel=channel;
		self.removeUser(channel,obj.name);
		self.output(obj)
	})
}
server.prototype.onPrivateMessage=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.channel=params[1];
	obj.isChannel=this.isChannel(obj.channel);
	obj.mode=this.getUserMode(obj.name,obj.channel);
	if(/^\01/.test(params[2]))
	{
		obj.type="CTCP";
		var ctcp = params[2].match(/^\01([A-Z]+) ?(.+)?\01/);
		obj.ctcp=ctcp[1];
		obj.message=ctcp[2];
	}
	else
	{
		obj.message=params[2];	
	}
	this.output(obj);
}
server.prototype.onMode=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	if(params && params[2])
	{
		obj.mode=params[2];
		
	}
	else
	{
		if(match[0].match(/^:([^\s ]+) (.+)/))
		{
			var m=match[0].match(/^:([^\s ]+) (.+)/);
			if(m[1].split(/!/))
			{
				obj.moder=m[1].split(/!/)[0];
			}	
		}
		params=match[3].match(/([^\s]+)\s(.*)/);
		obj.name=params[2].split(/\s/)[1];
		obj.channel=params[1];
		obj.mode=params[2].split(/\s/)[0];
	}
	this.output(obj);
}
server.prototype.onMOTD=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.message=params[2];
	this.output(obj);
}
server.prototype.onNotice=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.message=params[2];
	this.output(obj);
}
server.prototype.onUserList=function(match,params)
{
	var obj={};
	obj.channel=params[1].split(/\s/)[2];
	obj.type=match[2];
	obj.users=params[2].split(/\s/);
	this.output(obj);
	_.each(obj.users,function(user){
		self.addUser(obj.channel,user)
	})
}
server.prototype.onNumerical=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.message=params[2];

	if(params[1].match(/([^\s]+)\s(.*)/))
	{
		obj.channel=params[1].match(/([^\s]+)\s(.*)/)[2];
	}
	this.output(obj);
}
server.prototype.onPing=function()
{
	if(this.ping)
	{
		this.send('PONG');
	}
}
server.prototype.onSecureConnect=function(params)
{
	this.emitInfo("Established Secure Connection");
	this.emit("secure");
}
server.prototype.onError=function(error)
{
	console.log(error)
	this.emitInfo(error);
}
server.prototype.getUserNameOrServerName=function(message)
{
	//Returns either the servername or the username
	var servername=message.match(/^:([^\s ]+) (.+)/);
	if(message.match(/:([^!\s]+)!(.+)/))
	{
		return message.match(/:([^!\s]+)!(.+)/)[1];
	}
	else
	{
		if(servername)
			return servername[1];
		return false;
	}
}
server.prototype.enterChannel=function(channel)
{
	this.send("JOIN "+channel);
}
server.prototype.leaveChannel=function(channel)
{
	
}
server.prototype.quit=function(reason)
{
	
}
server.prototype.nick=function(nick)
{
	
}
server.prototype.say=function(channel,message)
{
	this.send("PRIVMSG "+channel+" :"+message);
}
server.prototype.output=function(obj)
{
	var time=new Date();
	obj.year=time.getFullYear();
	obj.month=time.getMonth()+1;
	obj.hour=time.getHours();
	obj.day=time.getDate();
	obj.seconds=time.getSeconds();
	this.emit(obj.type,JSON.stringify(obj));
	this.emit('DEBUG',JSON.stringify(obj));
	//Send to plugins
	this.messagePlugins(obj);
}
server.prototype.messagePlugins=function(obj)
{
	_.each(this.plugins,function(plugin){
		try{
			plugin.onMessage(obj);
		}catch(e)
		{
			//console.log(e)
		}
	});
}
server.prototype.emitInfo=function(info)
{
	this.emit("INFO",info);
}
server.prototype.onError=function(err)
{
	console.log(err);
}

server.prototype.parseUserMode=function(name)
{
	var mode=name[0];
	if(mode== "+" || mode=="@")
		return mode;
	return "";
}
server.prototype.parseUser=function(name)
{
	if(this.parseUserMode(name)!="")
		return name.substring(1,name.length);
	return name;
}
server.prototype.isChannel=function(channel)
{
	if(channel[0]=="#")
		return true;
	return false;
}
server.prototype.addUser=function(channel,name)
{
	if(!this.channels[channel])
		this.channels[channel]={};
		
	var mode=this.parseUserMode(name);
	var user=this.parseUser(name);
	if(!this.channels[channel][user])
		this.channels[channel][user]=mode;
	
}
server.prototype.getUserMode=function(channel,name)
{
	if(this.channels[channel] && this.channesls[channel][name])
		return this.channels[channel][name];
	return "";
}
server.prototype.userInChannel=function(channel,name)
{
	if(this.channels[channel] && this.channels[channel][name])
	{
		return true;
	}
	return false;
}
server.prototype.removeUser=function(channel,name)
{
	if(this.channels[channel] && this.channels[channel][name])
	{
		this.channels[channel][name]=null;
	}
	return true;
}
server.prototype.getUserChannels=function(name)
{
	var channels=[];
	_.each(this.channels,function(channel,channelname){
		if(channel[name] || channel[name]=="")
		{
			channels.push(channelname);
		}

	});
	return channels;
}
server.prototype.registerPlugins=function()
{
	console.log("Registering Plugins...");
	var folders=fs.readdirSync("plugins");
	try{
		_.each(folders,function(folder){
			var tmpstat=fs.statSync('plugins/'+folder);
			if(tmpstat.isDirectory())
			{
				var files=fs.readdirSync("plugins/"+folder);
				_.each(files,function(file){
					try{
						var filetmpst=fs.statSync("plugins/"+folder+"/"+file);
						if(filetmpst.isFile())
						{
							var tmp=require("./plugins/"+folder+"/"+file.substr(0,file.length-3));
							if(self.plugins[file.substr(0,file.length-3)])
							{
								console.log("WARNING: Plugin already exists! "+file.substr(0,file.length-3))
							}
							else
							{
								self.plugins[file.substr(0,file.length-3)]=new tmp.plugin(file.substr(0,file.length-3),folder);
								console.log("Plugin Registered: "+file.substr(0,file.length-3)+" ("+folder+")");
							}
						}
					}catch(e)
					{
						console.log(e)
					}
				});
			}
		});
	}catch(e)
	{
		console.log(e)
	}
	//Activate all the plugins
	_.each(self.plugins,function(plugin,name){
		try{
			self.plugins[name].registerPlugins(self.plugins,self);
		}catch(e)
		{
			
		}
	})
}
server.prototype.send = function(arg1) {
  if (this.connection.readyState !== 'open') {
   sys.puts("Unable to Send");
  }

  var message = [];
  for (var i = 0; i< arguments.length; i++) {
    if (arguments[i]) {
      message.push(arguments[i]);
    }
  }
  message = message.join(' ');
  message = message + "\r\n";
  this.connection.write(message, this.encoding);
};
