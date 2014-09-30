var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var moment = require('moment');
mongoose.connect("mongodb://localhost/fritterdb");

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error', err);
});

var Post;
var Account;
db.once('open', function () {
    console.log('connected.');
    var accountSchema = new mongoose.Schema({
        firstName : String,
        lastName : String,
        name : String,
        username : String,
        password : String
    });
    Account = mongoose.model("Account", accountSchema);
    
    var postSchema = new mongoose.Schema({
        username : String,
        title : String,
        body : String,
        name : String,
        timestamp : {type:String, default: moment().format("MMM Do YY, h:mm a")}
    });
    Post = mongoose.model("Post", postSchema);
});

/* GET home page. */
function index(req, res) {
    var id = req.cookies.id === undefined? "" : req.cookies.id;
    
    Account.findOne({_id:id}, function(err, acct) {
        if (acct === undefined || acct == null) {
            res.render('index', { title: 'Fritter', name:""});
        } else {
            console.log("finding posts");
            Post.find({},function(err, posts) {  
                if (posts.length == 0) {
                    console.log("POSTS FAILURE")
                    res.render('index', { title: 'Fritter', name:acct.name, username:acct.username, posts:[]});
                } else { 
                    console.log("formatting posts")
                    var formattedPosts = [];
                    for (var i = 0; i < posts.length; i++) {
                        var post = posts[i];
                        var id = post._id;
                        var title = post.title;
                        var user = post.name;
                        var username = post.username;
                        var timestamp = post.timestamp;
                        var content = post.body;

                        formattedPosts.push({id:id,title:title,user:user,username:username,content:content,timestamp:timestamp});
                    }

                    console.log("rendering")
                    res.render('index', { title: 'Fritter', name:acct.name, username:acct.username, posts:formattedPosts});
                }
            });
            
        }
    });
};

router.get('/', index);

router.get('/login', function(req, res) {
    var name = "";
    res.render('loginFull', { title: 'Fritter', name:name});
});

router.get('/signup', function(req, res) {
    var name = "";
    res.render('signupFull', { title: 'Fritter', name:name});
});

router.get('/logout', index);

router.get('/loginattempt', function index(req, res) {
    var username = req.query.username;
    var password = req.query.password;
    Account.findOne({username:username}, function(err, acct) {
        if (acct == null) {
            res.json({auth:false, ID:null});
        } else {
            if (acct.password == password) {
                res.json({auth:true, ID:acct._id});
            } else {
                res.json({auth:false, ID:null});
            }
        }
    });
});

router.get('/signupattempt', function index(req, res) {
    var first = req.query.first;
    var last = req.query.last;
    var username = req.query.username;
    var password = req.query.password;
    var account = new Account({
        firstName : first,
        lastName : last,
        name : first + " " + last,
        username : username,
        password : password
    });

    Account.find({username:username}, function(err, accts) {
        if (accts.length == 0) {
            account.save(function(err, acct) {
                if (err) return console.error(err);
                res.json({success:true, ID:acct._id});
            });
        } else {
            res.json({success:false, ID:null});
        }
    });
});

router.get('/submitpost', function index(req, res) {
    var id = req.cookies.id === undefined? "" : req.cookies.id;

    Account.findOne({_id:id}, function(err, acct) {
        var title = req.query.title;
        var body = req.query.body;
        var post = new Post({
            title : title,
            body : body,
            name : acct.name,
            username : acct.username
        });
        post.save(function(err, posted) {
            if (err) return console.error(err);
            res.json({success:true});
        });
    });
});

router.get('/deletepost', function index(req, res) {
    var id = req.cookies.id === undefined? "" : req.cookies.id;

    Account.findOne({_id:id}, function(err, acct) {
        Post.findOneAndRemove({_id:req.query.postId}, function() {
            res.json({success:true});
        });
    });
});

router.get('/editpost', function index(req, res) {
    var id = req.cookies.id === undefined? "" : req.cookies.id;

    Account.findOne({_id:id}, function(err, acct) {
        Post.findByIdAndUpdate(req.query.postId, {$set:{title:req.query.title,body:req.query.body}}, function() {
            res.json({success:true});
        });
    });
});

module.exports = router;
