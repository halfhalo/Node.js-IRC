var irc = exports;
var server = irc.server = require('./irc.js').server;

server.events = {};
server.prototype.checkEvent = function(ev_name) {
	if (!this.events) {
		return false;
	}
	if (ev_name in this.events && typeof this.events[ev_name] == "function") {
		return true;
	} else {
		return false;
	}
}

// onConnect
server.prototype.parentOnConnect = server.prototype.onConnect;
server.prototype.onConnect = function(params) {
	this.parentOnConnect(params);
	if (this.checkEvent('onConnect')) this.events.onConnect.bind(this)(params);
}

// onDisconnect
server.prototype.parentOnDisconnect = server.prototype.onDisconnect;
server.prototype.onDisconnect = function() {
	this.parentOnDisconnect();
	if (this.checkEvent('onDisconnect')) this.events.onDisconnect.bind(this)();
}

// onData
server.prototype.parentOnData = server.prototype.onData;
server.prototype.onData = function(data) {
	this.parentOnData(data);
	if (this.checkEvent('onData')) this.events.onData.bind(this)(data);
}

// onTooManyChannels
server.prototype.parentOnTooManyChannels = server.prototype.onTooManyChannels;
server.prototype.onTooManyChannels = function(match, params) {
	this.parentOnTooManyChannels(match, params);
	if (this.checkEvent('onTooManyChannels')) this.events.onTooManyChannels.bind(this)(match, params);
}

// onNicknameInUse
server.prototype.parentOnNicknameInUse = server.prototype.onNicknameInUse;
server.prototype.onNicknameInUse = function(match, params) {
	this.parentOnNicknameInUse(match, params);
	if (this.checkEvent('onNicknameInUse')) this.events.onNicknameInUse.bind(this)(match, params);
}

// onChannelMaker
server.prototype.parentOnChannelMaker = server.prototype.onChannelMaker;
server.prototype.onChannelMaker = function(match, params) {
	this.parentOnChannelMaker(match, params);
	if (this.checkEvent('onChannelMaker')) this.events.onChannelMaker.bind(this)(match, params);
}

// onNick
server.prototype.parentOnNick = server.prototype.onNick;
server.prototype.onNick = function(match, params) {
	this.parentOnNick(match, params);
	if (this.checkEvent('onNick')) this.events.onNick.bind(this)(match, params);
}

// onJoin
server.prototype.parentOnJoin = server.prototype.onJoin;
server.prototype.onJoin = function(match, params) {
	this.parentOnJoin(match, params);
	if (this.checkEvent('onJoin')) this.events.onJoin.bind(this)(match, params);
}

// onPart
server.prototype.parentOnPart = server.prototype.onPart;
server.prototype.onPart = function(match, params) {
	this.parentOnPart(match, params);
	if (this.checkEvent('onPart')) this.events.onPart.bind(this)(match, params);
}

// onQuit
server.prototype.parentOnQuit = server.prototype.onQuit;
server.prototype.onQuit = function(match, params) {
	this.parentOnQuit(match, params);
	if (this.checkEvent('onQuit')) this.events.onQuit.bind(this)(match, params);
}

// onPrivateMessage
server.prototype.parentOnPrivateMessage = server.prototype.onPrivateMessage;
server.prototype.onPrivateMessage = function(match, params) {
	this.parentOnPrivateMessage(match, params);
	if (this.checkEvent('onPrivateMessage')) this.events.onPrivateMessage.bind(this)(match, params);
}

// onMode
server.prototype.parentOnMode = server.prototype.onMode;
server.prototype.onMode = function(match, params) {
	this.parentOnMode(match, params);
	if (this.checkEvent('onMode')) this.events.onMode.bind(this)(match, params);
}

// onMOTD
server.prototype.parentOnMOTD = server.prototype.onMOTD;
server.prototype.onMOTD = function(match, params) {
	this.parentOnMOTD(match, params);
	if (this.checkEvent('onMOTD')) this.events.onMOTD.bind(this)(match, params);
}

// onNotice
server.prototype.parentOnNotice = server.prototype.onNotice;
server.prototype.onNotice = function(match, params) {
	this.parentOnNotice(match, params);
	if (this.checkEvent('onNotice')) this.events.onNotice.bind(this)(match, params);
}

// onUserList
server.prototype.parentOnUserList = server.prototype.onUserList;
server.prototype.onUserList = function(match, params) {
	this.parentOnUserList(match, params);
	if (this.checkEvent('onUserList')) this.events.onUserList.bind(this)(match, params);
}

// onNumerical
server.prototype.parentOnNumerical = server.prototype.onNumerical;
server.prototype.onNumerical = function(match, params) {
	this.parentOnNumerical(match, params);
	if (this.checkEvent('onNumerical')) this.events.onNumerical.bind(this)(match, params);
}

// onPing
server.prototype.parentOnPing = server.prototype.onPing;
server.prototype.onPing = function(match, params) {
	this.parentOnPing(match, params);
	if (this.checkEvent('onPing')) this.events.onPing.bind(this)(match, params);
}

// onSecureConnect
server.prototype.parentOnSecureConnect = server.prototype.onSecureConnect;
server.prototype.onSecureConnect = function(params) {
	this.parentOnSecureConnect(params);
	if (this.checkEvent('onSecureConnect')) this.events.onSecureConnect.bind(this)(params);
}

// onError
server.prototype.parentOnError = server.prototype.onError;
server.prototype.onError = function(error) {
	this.parentOnError(error);
	if (this.checkEvent('onError')) this.events.onError.bind(this)(error);
}


