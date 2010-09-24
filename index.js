var irc=require('./irc.js');
irc=new irc.server({'host':'','port':'','ping':true});
irc.connect({'nick':'','pass':'','user':'halfhalo','real':'halfhalo'});
