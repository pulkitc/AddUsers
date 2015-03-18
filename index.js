var express = require("express");
var bodyParser = require("body-parser");
var mongoUtil = require('./mdbUtil.js');
var swig = require('swig');
//port to listen
var port=3109;
var app = express();

//unencoding post data
app.use(bodyParser.urlencoded({
    extended: false
							}));



//default route
//app.use(app.router) --> Deprecated!
app.get('/', function(req, res) {

    try{
		//compiling template file for index.html
		var template = swig.compileFile('html/index.html');
		
		//storing the compiled template with data objects
		var output = template();
		res.writeHead(200, {
			'Content-Type': 'text/html'
							});
		res.end(output);
		}catch(e){
			throw new Error(e+'Error opening index file');
				}
								});

//route to fetch All users
app.get('/users', function(req, res) {

    mongoUtil.open(function(err) {
        if (err) 
			throw new Error(err + " mongoDB connection error");
        else{
           
            console.log("Connected to Database");
			var Users=mongoUtil.getUsersSchema();
			Users.find(function (err,users) {
				if (err) 
					throw new Error(err+"error finding users");
							
                try{
					var template = swig.compileFile('html/users.html');
					var output = template({
						users: users
											});

					res.writeHead(200, {
						'Content-Type': 'text/html'
										});
					res.end(output);
					}
				catch(e){
						throw new Error('Error opening users file');
						}
                
				//console.log(users)
				mongoUtil.close(function(err) {
					if (err) 
						throw new Error(err + "error closing mongoose connection @find");
					else {

						console.log("Connection closed - @find");
							}
												});
											});
            
			}
										});
	console.log('fetching all users');
	
    
									});


//route to add a user
app.post('/users/add', function(req, res) {

	var pattern=/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
		
	//email field empty
    if (!req.body.email)
		throw new Error('Email missing'); 
			
		//server side email validation
		//if email not valid
    if(!pattern.test( req.body.email ))
		throw new Error('Email Not valid!'); 
    
	//if mobile field not set
    if (!req.body.mob)
        throw new Error('Mobile missing');
		
	//check if name is set else send 500 error
    if (!req.body.name)
        throw new Error('Name missing - Mandatory');
    else {
        mongoUtil.open(function(err) {
        if (err) 
			throw new Error(err + " mongoDB connection error");
		else {
            console.log("Connected to Database");

			var Users=mongoUtil.getUsersSchema();
            var document = new Users({
				name: req.body.name,
                email: req.body.email,
				mobile: req.body.mob
									});
									
			document.save(function(err){
				if(err){
					mongoUtil.close(function(error) {
						if (error) 
							throw new Error(error + "error closing mongoose connection");
						else {

							console.log("closing Connection1");
							}			
													}); 
				throw new Error(err + " save error");
						}
				else {
					console.log(document);
					mongoUtil.close(function(err) {
        if (err) 
			throw new Error(err + "error closing mongoose connection");
		else {
            console.log("closing Connection2");
			}
													}); 
						}
										});
            }
									});
        res.send("<b class='alert alert-success'>" + req.body.name + " Added</b>");
		}
										});

//to catch an illegal route --> 404
app.get('*', function(req, res) {
    try{
		var template = swig.compileFile('html/notFound.html');
		var output = template({
			errMsg: 'Page Not Found'
								});

		res.writeHead(404, {
			'Content-Type': 'text/html'
							});
		res.end(output);
		}
	catch(e){
		throw new Error('Error opening notfound.html file');
			}
								});
//to catch errors & log them to the console	& to errors collection
app.use(error);

//catch errors & send custom 500 error message back & log to the errors collection
function error(error, req, res, next) {
    console.error(error);
	var errorMsg=error;
    mongoUtil.open(function(err) {
        if (err) 
			throw new Error(err + " mongoDB connection error for errors");
        else{
            console.log("Connected to Database");
			var Errors=mongoUtil.getErrorsSchema();
            var document = new Errors({
                    errmsg:errorMsg.stack 
										});
				
			// logging error stack at errors collection
            document.save(function(err) {
                if (err) 
					throw new Error(err + " db insert error for errors");
                console.log("Error recorded as " + document);
				mongoUtil.close(function(err){
					if(err)
						throw new Error(err+'Error closing DB - Errors');
						
					console.log("Closing connection @error Report");
											});
				
										});
			}
								});
	
    res.writeHead(500, {
        'Content-Type': 'text/html'
						});
    res.end("<b class=error>" + error + "</b>");
										}

//listen server on port
app.listen(port, function() {
    console.log("Started on PORT "+port+"\n!!! Don't Forget to update mongodb connection url in file mdbUtil.js !!!");
							});
