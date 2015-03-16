var MongoClient = require( 'mongodb' ).MongoClient;

var _db;

module.exports = {

connectToServer: function( callback ) {
MongoClient.connect( "mongodb://127.0.0.1:27017/users", function( err, db ) {
_db = db;
return callback( err );
} );
},

getDb: function() {
return _db;
}
};
