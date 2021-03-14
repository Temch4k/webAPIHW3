/*
    Name : Artsiom Skarakhod
    Project : Homework 3
    Description : Web API for Movie API
 */
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');



var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

// copied from Shawn and homework 2
// goes to sign up, if a field is empty, it won't let the user to be created
router.post('/signup', function(req, res) {
    // checks if the fields are empty
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
        //if they arent create a user
    }else {
        var user = new User()
        user.name = req.body.name
        user.username = req.body.username
        user.password = req.body.password

        // we save the user and if run into an error then we put the error out
        user.save(function(err){
            if (err) {
                if (err.code === 11000) return res.json({success: false, message: 'A user with that username already exist'})
                else
                    return res.json(err)
            }
            // otherwise send a happy note
            console.log("created new user")
            return res.status(200).json({success: true, message: "Successfully created new user."});
        })
    }
});

// does a signin option
router.post('/signin', function (req, res) {
    // create a new temp user and get the request's information saved into it
    var userNew = new User();
    userNew.username = req.body.username
    userNew.password = req.body.password

    // we find the user's username
    User.findOne({username: userNew.username}).select('name username password').exec(function(err, user){
        if(err){
            res.send(err)
            throw err
        }

        // if the user returns as a null that means we never found the username
        if(user == null)
        {
            res.json({success: false, msg: 'No user found with the following username'})
            res.status(401).send({success: false, msg: 'Authentication failed.'})
        }
        else{
            // if we did find a user, then we compare the password that was in our databas to the input
            user.comparePassword(userNew.password, function(isMatch){
                // if its matched we create a user token and send it to them
                if(isMatch){
                    var userToken = {id: user.id, username: user.username}
                    var token = jwt.sign(userToken, process.env.SECRET_KEY)
                    res.json({success: true, token: 'JWT ' + token})
                }
                // otherwise wrong password
                else{
                    res.status(401).send({success: false, msg: 'Authentication failed.'})
                }
        })
        }
    })
});


// this is where we manipulate the database
router.route('/moviecollection')
    // post adds a movie
    .post(authJwtController.isAuthenticated, function(req,res){            // create new movie
        var numOfChars = req.body.characters.length;
        var error = false;
        // goes thru character array inside of the body and makes sure that all the info is there
        for(var i = 0; i< numOfChars;i++) {
            if(req.body.characters[i].characterName === ''|| req.body.characters[i].characterName === '')
            {
                error = true;
                if(error)
                {
                    break;
                }
            }
        }
        // if there are less than 3 characters in a movie it won't let you add that movie
        if(numOfChars<3)
        {
            res.json({success: false, msg: 'Must have at least 3 movie characters'})
        }
        // if one of the fields are empty it won't let you add the movie
        else if (req.body.title === ''|| req.body.release === '' || req.body.genre === ''|| error ){
            res.json({success: false, msg: 'Please make sure you have entered all fields'})
        // otherwise we simply add the movie request into a temp movie
        } else {
            let mov = new Movie()
            mov.title = req.body.title
            mov.release = req.body.release
            mov.genre = req.body.genre
            mov.characters = req.body.characters;

            // then call a save command,
            mov.save(function(err){
                // if error then something went wrong, like a movie with the same name already exists
                if (err) {
                    console.log("sorry we ran into an error")
                    res.json({success: false, msg: 'we have an error posting'})
                    throw err
                }
                // otherwise we are good, and the movie has been added
                else{
                    res.json({success: true, msg: 'Movie added successfully'})
                }
            })
        }
    })

    // delete, delets a move from the database, by looking up it's name
    .delete(authJwtController.isAuthenticated, function (req,res){          // delete movie
        // we call findAndRemove, which finds a movie using a title and removes it
        Movie.findOneAndRemove({title: req.body.title}).select('title genre release characters').exec(function(err, movie){
            // if there is an error then something went wrong
            if (err)
            {
                res.json({success: false, msg: 'error occured'})
                console.log("could not delete")
                throw err
            }
            // if the movie returned is not null then we deleted the movie successfully
            else if(movie !== null)
            {
                console.log("Movie Deleted")
                res.json({success: true, msg: 'movie deleted successfully'})
            }
            // if the mvie is returned null then we never found a movie in the database with the same name
            else {
                res.json({success: false, msg: 'no movie was found'})
            }
        })
    })

    // put simply updates a movie in our database by looking up a name
    .put(authJwtController.isAuthenticated, function (req,res) {        // updates a movie
        // if the body is empty then the user never submitted the request properly
        // if the title is empty then we can't look up the movie we are editing
        // if the update is empty then we don't know what to update
        if(!req.body || !req.body.titleFind || !req.body.updateFind)
        {
            return res.status(403).json({success: false, message: "Error: Not all of the information is provided for an update"});
        }
        // we update the movie with given info
        else
        {
            // we update the movie by the title
            Movie.updateMany(req.body.titleFind, req.body.updateFind, function(err, movie)
            {
                JSON.stringify(movie);
                // if an error occured then we simply cancel the operation
                if(err)
                {
                    return res.status(403).json({success: false, message: "Error updating a movie"});
                    throw err;
                }
                // if movie is null then we never found the movie we were looking for
                else if(movie.n === 0)
                {
                    return res.status(404).json({success: false, message: "Error, can't find the movie"});
                    throw err;
                }
                // otherwise, if everything went well then we updated the movie
                else
                {
                    return res.status(200).json({success: true, message: "Succsessfully updated the movie"});
                    throw err;
                }
            })
        }
    })

    // gets movie information by looking up it's name
    .get(authJwtController.isAuthenticated, function (req, res) {
        // find the movie using the request title
        // .select is there to tell us what will be returned
        Movie.find({title: req.body.title}).select('title genre release characters').exec(function (err, movie) {
            // if we have an error then we display it
            if(err) {
                res.json({message: "Something is wrong: \n", error: err});
            }
            // otherwise just show the movie that was returned
            else {
                res.json(movie);
            }
        })
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


