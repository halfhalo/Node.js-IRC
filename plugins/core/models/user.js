Model.define('User',{

  collection : 'node-irc', // (optional) if not present uses the model name instead.

  // defines your data structure
  types: {
    _id : Object, // if not defined, Mongoose automatically defines for you.
    username: String,
    first : String,
    last : String,
	email : String,
	global : String,
    channels: {
      name : String,
	  rank : String
    },
	permissions: {
		channel : String,
		method : String,
		allow : String
	}
  },

  indexes : [
    'username',
    'channels.name'
	] 
  ],

  static : {}, // adds methods onto the Model.
  methods : {}, // adds methods to Model instances.

  setters: { // custom setters
  //  first: function(v){
  //    return v.toUpperCase();
  //  }
  },

  getters: { // custom getters
  //  username: function(v){
  //    return v.toUpperCase();
   // }
  }
});