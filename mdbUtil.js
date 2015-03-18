try {
  var mongoose = require('mongoose');
	} catch (_) {
		// workaround for mongoose
		var prequire = require('parent-require')
		, mongoose = prequire('mongoose');
				}

//users  schema
var Users = new mongoose.Schema({
	name: String,
	email: String,
	mobile: String,
	updated_at: { type: Date, default: Date.now }
								});
//errors  schema
var Errors = new mongoose.Schema({
	errmsg: String,
	updated_at: { type: Date, default: Date.now },
								});
module.exports = {

	open: function( callback ) {
	mongoose.connect( "mongodb://127.0.0.1:27017/users", function( err ) {

		return callback( err );
																									});
								},

getUsersSchema: function() {
	return mongoose.model('Users', Users);
							},
getErrorsSchema: function(){
	return mongoose.model('Errors', Users);
							},
close: function( callback ){
	mongoose.disconnect(function( err ) {
		return callback( err );
										});
							}
				};
