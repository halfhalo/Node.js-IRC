var palm=exports;
require('underscore');
var request = require('request');
var sys=require('sys')
var plugin=palm.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins=[];


}
plugin.prototype.registerPlugins=function(p,parent)
{
	this.plugins=p || {};
	var self=this;
	this.plugins['core'].in(["palm add :feed","palm add :feed :time"],function(items,obj,say){
	},['PRIVMSG']);

}
