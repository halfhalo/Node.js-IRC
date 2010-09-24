var parser=exports;
var plugin=parser.plugin=function(name,folder)
{
	this.plugins={};
	this.parent={};
}
plugin.prototype.registerPlugins=function(plugins,parent)
{
	this.plugins=plugins || {};
	this.parent=parent || {};
}
plugin.prototype.message=function(parser,message,callback)
{
	var obj=this.toRegex(parser);
	console.log(message)
	console.log(obj);
	console.log(obj.test(message));
	callback();
}
plugin.prototype.getKeys=function(message)
{
	var keys=[];
	message= message.replace(/\./g, "\\.")
			
		.replace(/:(\w+)/g,function(_,key){
		var tmpk=key.substr(1,key.length);
		keys.push(tmpk);
		return ":(\w+)";
	});
	return keys;
}
plugin.prototype.toRegex=function(message)
{
	message=message.replace(/\./g, "\\.")
		.replace(/:(\w+)/g,function(_,key){
		return "(\w+)";
	});
	var reg=new RegExp(message)
	return reg;
}