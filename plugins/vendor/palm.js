var palm=exports;
require('underscore');
var keys=require('keys');
var request = require('request');
var plugin=palm.plugin=function(name,folder)
{
	this.name=name;
	this.folder=folder;
	this.plugins=[];
	this.feeds=new keys.nStore({'path':'feeds.db'});
	this.packages=new keys.nStore({'path':'packages.db'});
}
plugin.prototype.registerPlugins=function(p,parent)
{
	this.plugins=p || {};
	var self=this;
	this.plugins['core'].in(["palm add :feed","palm add :feed :time"],function(items,obj,say){
		self.addFeed(items.feed,obj.channel,function(res){
			console.log(res)
		})
	},['PRIVMSG'],["+"]);
}
plugin.prototype.addFeed=function(feed,channel,callback)
{
	var self=this;
	this.getFeeds(channel,function(feeds){
		if(feeds[feed])
		{
			callback(false,"Feed already Exists")
		}
		else
		{
			callback(true,"Added Feed");
			feeds[feed]=feed;
			self.feeds.set(channel,JSON.stringify(feeds));
			
			self.downloadFeed(feed,function(p){
				self.packages.has(channel,function(err,exists){
					if(exists)
					{
						self.packages.get(channel,function(err,pack){
							pack=JSON.parse(pack);
							_.each(p,function(app){
								if(pack.indexOf(app)==-1 || pack[app.Package].LastUpdated < app.LastUpdated)
								{
									pack[app.Package]=app;
								}
							})
							self.packages.set(channel,JSON.stringify(pack));
						})
					}
					else
					{
						var q={}
						_.each(p,function(app){
							q[app.Package]=app;
						});
						self.packages.set(channel,JSON.stringify(q));
					}
				});
			});
		}
	})
}
plugin.prototype.downloadFeed=function(feed,cb)
{
	var self=this;
	request({uri:feed}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      self.parseFeed(body,function(res){
		cb(res)
});
    }
  })
}
plugin.prototype.parseFeed=function(data,cb)
{
	var obj=[];

	var self=this;
	var packs=data.split('\n\n');
	_.each(packs,function(d){
		try{
			if(d!="" || d!=" ")
				obj.push(self.packageToJSON(d));
		}
		catch(e)
		{

		}
	})

		cb(obj);
}
plugin.prototype.packageToJSON=function(package)
{
	var self=this;
	var obj={};
	var data=package.split('\n');
	_.each(data,function(line){
		try{
			var items=line.match(/^([^\s]+):(.*)/);

			try{
				obj[items[1]]=JSON.parse(items[2]);
			}
			catch(e)
			{
				obj[items[1]]=items[2];
			}
		}catch(e)
		{
		}
	});
	return obj;
}
plugin.prototype.getFeeds=function(channel,callbak)
{
	var self=this;
	this.feeds.has(channel,function(err,exists){
		if(exists)
		{
			self.feeds.get(channel,function(err,feeds){
				try{
					callbak(JSON.parse(feeds))
				}catch(e)
				{
					callback({});
				}
				
			})
		}
		else
		{
			callbak({})
		}
	})

}