var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var moment = require('moment');
var connection_string = 'localhost/fritter';

// connect to the openshift mongo db
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/fritter';
}
mongoose.connect(connection_string);

var db = mongoose.connection;

// handle connection errors
db.on('error', function (err) {
    console.log('connection error', err);
});

// Create mongoose models
var Post;
var Account;
// Create mongoose schemae and models after connection is established
db.once('open', function () {
    console.log('connected.');
    var accountSchema = new mongoose.Schema({
        firstName   : String,
        lastName    : String,
        name        : String,
        username    : String,
        password    : String,
        following   : [String]
    });
    Account = mongoose.model("Account", accountSchema);
    
    var postSchema = new mongoose.Schema({
        username    : String,
        title       : String,
        body        : String,
        name        : String,
        timestamp   : String
    });
    Post = mongoose.model("Post", postSchema);
});

// what to render if we lookup a user
function userLookupRender (req, res, userQuery, acct, posts) {
    // try to find the searched user
    Account.findOne({username:userQuery}, function(err, searchedAcct) {
        // if we dont find the user, send back to feed
        if (searchedAcct == null) {
            res.redirect('/');
            return;
        }

        // Check if the searched user is the user's self
        var self = false;
        if (searchedAcct.username == acct.username) {
            self = true;
        }

        // see if we are following this user
        var following = acct.following.indexOf(searchedAcct.username) != -1 ? true : false;

        // show no posts if the user has no posts
        if (posts.length == 0) {
            res.render('index',
                {
                    following       : following,
                    self            : self,
                    userLookup      : true,
                    searchedUsername: searchedAcct.username,
                    searchedFirst   : searchedAcct.firstName,
                    title           : searchedAcct.name,
                    name            : acct.name,
                    username        : acct.username,
                    posts           : []
                });
        } else { 
            // formats posts and displays the user's posts
            var formattedPosts = [];
            for (var i = 0; i < posts.length; i++) {
                var post        = posts[i];
                var id          = post._id;
                var title       = post.title;
                var user        = post.name;
                var username    = post.username;
                var timestamp   = post.timestamp;
                var content     = post.body;

                formattedPosts.push(
                    {
                        id          : id,
                        title       : title,
                        user        : user,
                        username    : username,
                        content     : content,
                        timestamp   : timestamp
                    });
            }

            // renders the feed
            res.render('index',
                {
                    following       : following,
                    self            : self,
                    userLookup      : true,
                    searchedUsername: searchedAcct.username,
                    searchedFirst   : searchedAcct.firstName,
                    title           : searchedAcct.name,
                    name            : acct.name,
                    username        : acct.username,
                    posts           : formattedPosts
                });
        }
    });
};

// Renders the feed
function feedRender(req, res, acct, posts) {
    // returns an instructional post if nobody has posted or is followed
    if (posts.length == 0) {
        res.render('index',
            {
                userLookup  : false,
                title       : 'Fritter',
                name        : acct.name,
                username    : acct.username,
                posts       : [{
                                id          : 0,
                                title       : "No posts to show",
                                user        : "Nobody :(",
                                username    : "",
                                content     : "Try searching for a username and following someone to see posts on your feed other than yours!",
                                timestamp   : moment().format("MMM Do YY, h:mm a")
                              }]
            });
    } else { 
        // formats posts and displays the feed of posts
        var formattedPosts = [];
        for (var i = 0; i < posts.length; i++) {
            var post        = posts[i];
            var id          = post._id;
            var title       = post.title;
            var user        = post.name;
            var username    = post.username;
            var timestamp   = post.timestamp;
            var content     = post.body;

            formattedPosts.push(
                {
                    id          : id,
                    title       : title,
                    user        : user,
                    username    : username,
                    content     : content,
                    timestamp   : timestamp
                });
        }

        // renders the feed
        res.render('index',
            {
                userLookup  : false,
                title       : 'Fritter',
                name        : acct.name,
                username    : acct.username,
                posts       : formattedPosts
            });
    }
};

// functional that returns a rendering function given if it is a user lookup or not
function index(userLookup) {

    // render the main page that servs as a login page and the main feed page and user page
    var output = function(req, res)  {
        // reads the ID from the cookie if it exists and sets it to an appropriate value
        var id = req.cookies.id === undefined? "" : req.cookies.id;

        // get the user query if there is one
        var userQuery;
        if (userLookup) {
            userQuery = req.query.username;
        }
        
        // finds the account associated with the cookie
        Account.findOne({_id:id}, function(err, acct) {
            // loads the login page if user cookie does not authenticate
            if (acct === undefined || acct == null) {
                if (userLookup) {
                    res.redirect('/');
                } else {
                    res.render('index', { title: 'Fritter', name:""});
                }
            } else {
                // get the list of people the user is following and format it for a mongoose query
                var following = acct.following;
                var followingQuery = [];
                for (var i = 0; i < following.length; i++) {
                    followingQuery.push({username:following[i]});
                }

                // if this is a query, it looks just for the posts belonging to the user queried,
                // if it is not a query, it looks for all the posts of people you follow
                Post.find(userLookup ? {username:userQuery} : {$or:followingQuery},function(err, posts) { 
                    // render based on if it is a lookup or not
                    if (userLookup) {
                        userLookupRender(req,res, userQuery, acct, posts);
                    } else {
                        feedRender(req, res, acct, posts);
                    }
                });
                
            }
        });
    };

    return output;
};

// displays the feed / login page
router.get('/', index(false));

// dispalys a dedicated login page
router.get('/login', function(req, res) {
    var name = "";
    res.render('loginFull', { title: 'Fritter', name:name});
});

// displays the signup page
router.get('/signup', function(req, res) {
    var name = "";
    res.render('signupFull', { title: 'Fritter', name:name});
});

// displaysthe main page, but clears cookies thus forcing the login page
router.get('/logout', index(false));

// attempts to login the user
router.get('/loginattempt', function index(req, res) {
    // gets the username / password from the incoming json
    var username = req.query.username;
    var password = req.query.password;
    // tries to lookup the username
    Account.findOne({username:username}, function(err, acct) {
        // return a false auth if the username cannot be found
        if (acct == null) {
            res.json({auth:false, ID:null});
        } else {
            // return a true auth if password matches
            if (acct.password == password) {
                res.json({auth:true, ID:acct._id});
            } else {
                // return a false auth if password does not match
                res.json({auth:false, ID:null});
            }
        }
    });
});

// sighs the user up for the website and writes to the DB
router.get('/signupattempt', function index(req, res) {
    // get user info from the incoming json
    var first = req.query.first;
    var last = req.query.last;
    var username = req.query.username;
    var password = req.query.password;
    // create the account object and makes the user follow themself
    var account = new Account({
        firstName   : first,
        lastName    : last,
        name        : first + " " + last,
        username    : username,
        password    : password,
        following   : [username]
    });

    // check if the username already exists
    Account.find({username:username}, function(err, accts) {
        // if not in the userbase, save the user to the db
        if (accts.length == 0) {
            // save the user to the userbase
            account.save(function(err, acct) {
                // log errors
                if (err) return console.error(err);
                // tell the user it was saved
                res.json({success:true, ID:acct._id});
            });
        } else {
            // if not in the userbase, tell the client that it was not saved
            res.json({success:false, ID:null});
        }
    });
});

// render the user page given that we are performing a user query.
router.get('/user', index(true));

// submit a post to the db
router.get('/submitpost', function index(req, res) {
    // get the ID from the cookie
    var id = req.cookies.id === undefined? "" : req.cookies.id;

    // find the user associated with the req and post as him
    Account.findOne({_id:id}, function(err, acct) {
        // get the appropriate info from the incoming json
        var title = req.query.title;
        var body = req.query.body;
        // create the post
        var post = new Post({
            title       : title,
            body        : body,
            name        : acct.name,
            username    : acct.username,
            timestamp   : moment().format("MMM Do YY, h:mm a")
        });

        // save the post to the DB
        post.save(function(err, posted) {
            if (err) return console.error(err);
            // return a true response.
            res.json({success:true});
        });
    });
});

// delete a post from the db
router.get('/deletepost', function index(req, res) {
    // find the post by id and remove it
    Post.findOneAndRemove({_id:req.query.postId}, function() {
        res.json({success:true});
    });
});

// edit a post from the db
router.get('/editpost', function index(req, res) {
    // find the post by id and change hte body and title
    Post.findByIdAndUpdate(req.query.postId, {$set:{title:req.query.title,body:req.query.body}}, function() {
        res.json({success:true});
    });
});

// unfollow a user
router.get('/unfollow', function index(req, res) {
    // finds who the requestor is
    Account.findById(req.query.requestor, function (err, acct) {
        var following = acct.following;
        var index = following.indexOf(req.query.target);

        // removes the user from the following list
        if (index != -1) {
            following.splice(index, 1);
        }
        
        // updates the entry in the db and sends a success response
        Account.findByIdAndUpdate(req.query.requestor, {$set:{following:following}}, function() {
            res.json({success:true});
        });
    });
});

// follow a user
router.get('/follow', function index(req, res) {
    // finds who the requestor is
    Account.findById(req.query.requestor, function (err, acct) {
        // adds the user to the following list
        var following = acct.following;
        following.push(req.query.target);

        // udpates the entry in the db and sends a success response
        Account.findByIdAndUpdate(req.query.requestor, {$set:{following:following}}, function () {
            res.json({success:true});
        });
    });
});

module.exports = router;
