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
//Create a new irc connection
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
//Initiate the connection to the irc server
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
		self.onError(error);
	});
	connection.addListener('end',function(){
		self.onDisconnect(params);
	});
	this.connection=connection;
}

server.prototype.disconnect=function() {
  this.connection.end();
  this.connection.destroy();
}
//Function triggered on Connect.  Sends nick, name, realname, and optionally server password
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
//Triggered on server disconnect.
server.prototype.onDisconnect=function()
{
	this.emitInfo("Connection Terminated");
	this.emit("end");
}
//Parses Message type and calls corresponding function
server.prototype.onData=function(data)
{

	this.emit("data", data);	

	this.buffer=this.buffer+data;
	//Split buffer by new lines to account for incomplete data strings
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
					this.onPing(match,params);
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
				case '405':
				this.onTooManyChannels(match,params);
				break;
				case '433':
				this.onNicknameInUse(match,params);
				break;
				case 'PONG':
				break;
			}
		}
	}
}
server.prototype.onTooManyChannels = function(match, params) {
	this.emit("tooManyChannels", match, params);
};
server.prototype.onNicknameInUse = function(match, params) {
	this.emit("nicknameInUse", match, params);
};

//Triggered when we get a message with the channel creation information
server.prototype.onChannelMaker=function(match,params)
{
	//console.log(this.getUserNameOrServerName(match[0]))
	//console.log(params);
	//console.log(match[3].match(/([^\s]+)\s(.*)/));
}
//Triggered on nick change
server.prototype.onNick=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.nick=match[3].substring(1,match[3].length);
	this.output(obj);
}
//Triggered on user join
server.prototype.onJoin=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	
	obj.channel=params[2];
	this.output(obj);
	self.addUser(obj.channel,obj.name);
}
//Triggered on user Part
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
//Triggered on user Quit
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
//Triggered on messages to user or to channel
server.prototype.onPrivateMessage=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.channel=params[1];
	obj.isChannel=this.isChannel(obj.channel);
	obj.mode=this.getUserMode(obj.channel,obj.name);
	//Test for CTCP messages
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
	this.emit("message", obj);
	this.output(obj);
}
//Triggered on Mode Message
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
//Triggered on MOTD from server
server.prototype.onMOTD=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.message=params[2];
	this.output(obj);
}
//Triggered on Notice Message
server.prototype.onNotice=function(match,params)
{
	var obj={};
	obj.name=this.getUserNameOrServerName(match[0]);
	obj.type=match[2];
	obj.message=params[2];
	this.output(obj);
}
//Triggered on Channel user list
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
//Catchall for unhandled numerical messages
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
//Responds to server Ping....
server.prototype.onPing=function(match, params)
{
  this.emit("ping", match, params);
  if(this.ping) {
    this.send('PONG ' + params[3]);
  }
}
//Emits on secure connect
server.prototype.onSecureConnect=function(params)
{
	this.emitInfo("Established Secure Connection");
	this.emit("secure");
}
//Emmited on Server Error
server.prototype.onError=function(error)
{
	console.log(error)
	this.emitInfo(error);
	this.emit("error", error);
}
//Returns the username in the message, or servername if username is absent
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
//Enter Channel
server.prototype.enterChannel=function(channel)
{
	this.send("JOIN "+channel);
}
//Leave Channel
server.prototype.leaveChannel=function(channel, message)
{
	if (message !== undefined && message.length > 0) {
		this.send("PART " + channel + " " + message)
	} else {
		this.send("PART " + channel);
	}
}
server.prototype.quit=function(reason)
{
	this.send("QUIT "+reason);
}
server.prototype.changeNick=function(nick)
{
	this.send("NICK " + nick);
}
server.prototype.say=function(channel,message)
{
	this.send("PRIVMSG "+channel+" :"+message);
}
//Single output source, also sends the message to all the functions
server.prototype.output=function(obj)
{

	this.emit(obj.type,JSON.stringify(obj));
	this.emit('DEBUG',JSON.stringify(obj));
	//Send to plugins
	this.plugins.onMessage(obj);
}
//Sends the message to all plugins.
server.prototype.messagePlugins=function(obj)
{
	
}
//emit info
server.prototype.emitInfo=function(info)
{
	this.emit("INFO",info);
}
//On Error
server.prototype.onError=function(err)
{
	console.log(err);
}
//Return user mode
server.prototype.parseUserMode=function(name)
{
	var mode=name[0];
	if(mode== "+" || mode=="@")
		return mode;
	return "";
}
//Return user without mode
server.prototype.parseUser=function(name)
{
	if(this.parseUserMode(name)!="")
		return name.substring(1,name.length);
	return name;
}
//Check if message is to channel
server.prototype.isChannel=function(channel)
{
	if(channel[0]=="#")
		return true;
	return false;
}
//Add user to internal userlist
server.prototype.addUser=function(channel,name)
{
	if(!this.channels[channel])
		this.channels[channel]={};
		
	var mode=this.parseUserMode(name);

	var user=this.parseUser(name);
	if(!this.channels[channel][user])
		this.channels[channel][user]=mode;
	
}
//Get user mode from internal userlist
server.prototype.getUserMode=function(channel,name)
{
	if(this.channels[channel] && this.channels[channel][name])
	{
		return this.channels[channel][name];	
	}
	return "";
}
//Return true if user in channel
server.prototype.userInChannel=function(channel,name)
{
	if(this.channels[channel] && this.channels[channel][name])
	{
		return true;
	}
	return false;
}
//Remove user from channel
server.prototype.removeUser=function(channel,name)
{
	if(this.channels[channel] && this.channels[channel][name])
	{
		this.channels[channel][name]=null;
	}
	return true;
}
//Get channels user is in
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
	//Load in core plugin module, which will load in the rest
	var coreplugins={};
	//var folders=fs.readdirSync("plugins");
	try{
		var plugins=require('../plugins/pluginManager');
		this.plugins=new plugins.manager(this);
	}
	catch(e)
	{
		sys.puts(e)
	}
}
//Send Message down the pipe.
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
