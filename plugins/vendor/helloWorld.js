var hello=exports;
var sys=require('sys');
require('underscore');
var plugin=hello.plugin=function(manager,route)
{
	this.manager=manager;
	this.router=route;
	route.on("hi :there \":blasdah\" :$numbers")
	route.on("hello")
}