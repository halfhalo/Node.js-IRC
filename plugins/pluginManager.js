var plugin=exports;
var sys=require('sys');
var fs= require('fs');
require('underscore');
var manager=plugin.manager=function(parent,prefix)
{
	this.core={};
	this.plugins={}
	this.parent={};
	this.routes=[];
	this.prefix=prefix || "!";
	this.loadCore();
	this.loadPlugins()
}
manager.prototype.onMessage=function(obj)
{
	this.core['core'].onData(obj)
}
manager.prototype.loadPlugins=function(){
	var files=fs.readdirSync('plugins/vendor');
	var self=this;
	_.each(files,function(file){
		if(self.isFile(fs.realpathSync('plugins/vendor/'+file)))
		{
			try{
				var name=file.substr(0,file.length-3);
				var tmp=require(fs.realpathSync('./plugins/vendor/')+"/"+name);
				self.plugins[name]= new tmp.plugin(self,self.core['core']);
				console.log(name+" Loaded (vendor)");
			}catch(e)
			{
				console.log("Error Loading "+name+": "+e)
			}

		}
	})
}
manager.prototype.loadCore=function()
{
	var files=fs.readdirSync('plugins/core');
	var self=this;
	_.each(files,function(file){
		if(self.isFile(fs.realpathSync('plugins/core/'+file)))
		{
			var name=file.substr(0,file.length-3);
			var tmp=require(fs.realpathSync('./plugins/core/')+"/"+name,self);
			self.core[name]= new tmp.plugin(self.parent,self);
			console.log(name+" Loaded");
		}
	})
}

manager.prototype.isFile=function(path)
{
	var tm=fs.statSync(path);
	if(tm.isFile())
	{
		return true;
	}
	else
	{
		return false;
	}
}