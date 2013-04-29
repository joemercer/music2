// require() is node's way of loading modules. 
var express = require('express');

// set up express
var app = express();

// routes
// app.get('/query', function(req, res){
// 	console.log('page requested: ' + req.url);
// 	// res.json({part1: db[0]});
// 	res.json({query : db[0]});
// });
// app.get('/answer/:id', function(req, res){
// 	console.log('page requested: ' + req.url);
// 	res.send(db[0].results[1].snippet);
// });

// // ensures that we p1 send route, and p2 look for static files
// app.use(app.router);

// this handles requests for static content 
// as organized in the file structure
app.use(express.static(__dirname + '/app'));




app.listen(8080, function() {
	console.log('Server running on port 8080...');
});