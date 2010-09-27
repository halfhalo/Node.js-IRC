var db=exports;
var async=require('async')
var sys=require('sys')
var sqlite=require('sqlite');
require('underscore');
var plugin=db.plugin=function(name)
{
	this.db=db = new sqlite.Database();
	this.name=name;
	this.restrictions="";
	this.get("users","test",function(){},"username");
	//this.add("users",{"username":"test"},function(err,num){
		
	//});
}
plugin.prototype.dbOpen=function(callback)
{
	var self=this;
	this.db.open(this.name,function(e){
		self.db.query("PRAGMA foreign_keys = ON;",function(){
			callback(true);
		})
		
	});
}
plugin.prototype.new=function(tablename,fields,restrictions)
{
	this.restrictions=restrictions;
	var self=this;
	this.dbOpen(function(res){
		self.generateTable(tablename,fields,null,function(r){
			//if(r)
				//console.log(r)
		});
	})
}
plugin.prototype.generateTable=function(tablename,fields,f,callback)
{
	if(f)
	var output="CREATE TABLE "+f+"_"+tablename+"(";
	else
	var output="CREATE TABLE "+tablename+"(";
	output+="\n"+tablename+"id  INTEGER PRIMARY KEY AUTOINCREMENT";
	if(f)
	{
		output+=",\n "+f+" INTEGER";
		
	}
		
	var self=this;
	_.each(fields,function(type,field){
		if(typeof type=="string" || type=="string" || type=="text")
		{
			output+=",\n"+field+"  TEXT";
		}
		if(typeof type=="object")
		{
			self.generateTable(field,type,tablename,callback);
		}

	})
	if(f)
		output+=",\nFOREIGN KEY("+f+") REFERENCES "+f+"("+f+"id)";
	output+="\n);";
		self.db.query(output,function(err){
			callback(err||true)
		})

}
plugin.prototype.get=function(tablename,key,callback,comp)
{
	var self=this;
	var sql="SELECT * FROM "+tablename+" WHERE "+(comp || this.restrictions)+"='"+key+"';";
	this.dbOpen(function(r){
		self.db.prepare(sql,function(err,row){
			if(!err)
			{
				row.fetchAll(function(e,r){
					callback(e,r)
				})
			}
		})
	});
}
plugin.prototype.set=function(tablename,key,obj,callback,trans)
{
	var self=this;
	var values="";
	var columns="";
	var output="INSERT OR REPLACE INTO "+tablename+"";
	_.each(obj,function(value,name){
		if(values.length==0)
		{
			values+=value;
			columns+=name;
		}
		else
		{
			values+=","+value;
			columes+=","+name;
		}
	})
	output+=" ("+columns+") VALUES (\""+values+"\")"
	output+=" WHERE "+(comp || this.restrictions)+"='"+key+"';"
	try{
		this.dbOpen(function(r){
			self.db.insert(output,function(e,i){
				callback(e,i)
			})
		})
		
	}catch(e)
	{
		sys.puts(e)
	}
	
}
plugin.prototype.has=function(tablename,key,callback,comp)
{
	var self=this;
	this.db.get(tablename,key,function(error,res){
		if(res)
		{
			callback(res.length)
		}
		else
		{
			callback(false);
		}
	},comp)
}
plugin.prototype.add=function(tablename,obj,callback,trans)
{
	var self=this;
	var values="";
	var columns="";
	var output="INSERT INTO "+tablename+"";
	_.each(obj,function(value,name){
		if(values.length==0)
		{
			values+=value;
			columns+=name;
		}
		else
		{
			values+=","+value;
			columes+=","+name;
		}
	})
	output+=" ("+columns+") VALUES (\""+values+"\");"
	try{
		this.dbOpen(function(r){
			self.db.insert(output,function(e,i){
				callback(e,i)
			})
		})
		
	}catch(e)
	{
		sys.puts(e)
	}

	
}