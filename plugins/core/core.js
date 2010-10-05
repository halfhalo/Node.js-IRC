var core=exports;
var sys=require('sys');
require('underscore');
var plugin=core.plugin=function(parent)
{
	this.plugins={};
	this.parent={};
	this.routes=[];
	this.prefix="!";
}