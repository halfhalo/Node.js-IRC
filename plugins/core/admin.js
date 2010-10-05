var admin=exports;
var sys=require('sys');
require('underscore');
var plugin=admin.plugin=function(parent,manager)
{
	this.manager=manager;
	this.parent={};
	
}
