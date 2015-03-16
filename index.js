var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoUtil = require('../p1/mdbUtil.js');
var swig = require('swig');

app.use(bodyParser.urlencoded({
    extended: false
}));




app.get('/', function(req, res) {

    try{
	var template = swig.compileFile('html/index.html');
    var output = template();
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(output);
	}
				catch(e){
				throw new Error('Error opening index file');
				}
});

app.get('/users', function(req, res) {


    mongoUtil.connectToServer(function(err) {
        if (err) throw new Error(err + " mongoDB connection error");
        else {

            db = mongoUtil.getDb();
            console.log("Connected to Database" + db);


            var cursor = db.collection('users').find().toArray(function(err, items) {

                try{
				var template = swig.compileFile('html/users.html');
                var output = template({
                    users: items
                });

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(output);
				}
				catch(e){
				throw new Error('Error opening users file');
				}
                console.log(items);


            });
        }
    });
    console.log('fetching all users');
});

app.post('/users/add', function(req, res) {

    //console.log('adding users'+req.body.name+" "+req.body.email+" "+req.body.mob);
    if (!req.body.email) {
        throw new Error('Email missing');

    }

    if (!req.body.mob)
        throw new Error('Mobile missing');

    if (!req.body.name)
        throw new Error('Name missing - Mandatory');
    else {

        mongoUtil.connectToServer(function(err) {
            if (err) throw new Error(err + " mongoDB connection error");
            else {

                db = mongoUtil.getDb();
                console.log("Connected to Database" + db);


                var document = {
                    name: req.body.name,
                    mobileNum: req.body.mob,
                    emailId: req.body.email
                };

                //inserting record
                db.collection('users').insert(document, function(err, records) {
                    if (err) throw new Error(err + " db insert error");
                    else
                        console.log("User Record added as " + records[0]._id);
                });
            }
        });

        res.send("<b class='alert alert-success'>" + req.body.name + " Added</b>");
    }
});

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
app.use(error);

function error(error, req, res, next) {
    console.error(error);
    mongoUtil.connectToServer(function(err) {
        if (err) throw new Error(err + " mongoDB connection error for errors");
        else {

            db = mongoUtil.getDb();
            console.log("Connected to Database" + db);

            db.collection('error').insert({
                error: error.stack,
                date: Date.now
            }, function(err, records) {
                if (err) throw new Error(err + " db insert error for errors");
                else
                    console.log("Error recorded as " + records[0]._id);
            });
        }
    });
    res.writeHead(500, {
        'Content-Type': 'text/html'
    });
    res.end("<b class=error>" + error + "</b>");
}


app.listen(3000, function() {
    console.log("Started on PORT 3000");
});
