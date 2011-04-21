var modules=exports;
var sys=require('sys');
var _=require('underscore');
var plugin=modules.plugin=function(parent,manager)
{
	this.manager=manager;
	this.parent={};	
	this.route=this.manager.core['core'];
	this.route.on("list modules",function(items,obj,say){
		console.log("hi!")
	});
}
//Lets See if This works at all...

