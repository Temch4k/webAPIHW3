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

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    }else {
        var user = new User()
        user.name = req.body.name
        user.username = req.body.username
        user.password = req.body.password

        user.save(function(err){
            if (err) {
                if (err.code === 11000) return res.json({success: false, message: 'A user with that username already exist'})
                else
                    return res.json(err)
            }
            console.log("created new user")
            return res.status(200).json({success: true, message: "Successfully created new user."});
        })
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username
    userNew.password = req.body.password

    User.findOne({username: userNew.username}).select('name username password').exec(function(err, user){
        if(err){
            res.send(err)
            throw err
        }

        if(user == null)
        {
            res.json({success: false, msg: 'No user found with the following username'})
            res.status(401).send({success: false, msg: 'Authentication failed.'})
        }
        else{
            user.comparePassword(userNew.password, function(isMatch){
                if(isMatch){
                    var userToken = {id: user.id, username: user.username}
                    var token = jwt.sign(userToken, process.env.SECRET_KEY)
                    res.json({success: true, token: 'JWT ' + token})
                }
                else{
                    res.status(401).send({success: false, msg: 'Authentication failed.'})
                }
        })
        }
    })
});


router.route('/moviecollection')
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
        if(numOfChars<3)
        {
            res.json({success: false, msg: 'Must have at least 3 movie characters'})
        }
        else if (req.body.title === ''|| req.body.release === '' || req.body.genre === ''|| error ){
            res.json({success: false, msg: 'Please make sure you have entered all fields'})
        } else {
            let mov = new Movie()
            mov.title = req.body.title
            mov.release = req.body.release
            mov.genre = req.body.genre
            mov.characters.characterName = req.body.characters.characterName
            mov.characters.actorName= req.body.characters.actorName

            mov.save(function(err){
                if (err) {
                    console.log("sorry we ran into an error")
                    res.json({success: false, msg: 'we have an error posting'})
                    throw err
                }
                else{
                    res.json({success: true, msg: 'Movie added successfully'})
                }
            })
        }
    })

    .delete(authJwtController.isAuthenticated, function (req,res){          // delete movie
        Movie.findOneAndRemove({title: req.body.title}).select('title genre release characters').exec(function(err, movie){
            if (err)
            {
                res.json({success: false, msg: 'error occured'})
                console.log("could not delete")
                throw err
            }
            else if(movie !== null)
            {
                console.log("Movie Deleted")
                res.json({success: true, msg: 'movie deleted successfully'})
            }
            else {
                res.json({success: false, msg: 'no movie was found'})
            }
        })
    })

    .put(authJwtController.isAuthenticated, function (req,res) {        // updates a movie
        if(!req.body || !req.body.findMovie || !req.body.updateMovieTo)
        {
            return res.status(403).json({success: false, message: "Error: please provide something that can be updated"});
        }
        else{
            res.json({msg:'FindMovie: ' + JSON.stringify(req.body.findMovie)+ 'UpdateMovieTo: ' + JSON.stringify(req.body.updateMovieTo)});
            Movie.updateMany(req.body.findMovie, req.body.updateMovieTo, function(err, output)
            {
                console.log(JSON.stringify(output));
                if(err)
                {
                    return res.status(403).json({success: false, message: "Error: editing a movie"});
                }
                else if(output.n == null)
                {
                    return res.status(402).json({success: false, message: "Error: no movie was found"});
                }
                else
                {
                    return res.status(200).json({success: true, message: "Movie updated successfully"});
                }
            })
        }
    })

    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movie) {
            if(err) res.json({message: "Ooops, something is wrong. Read error. \n", error: err});
            res.json(movie);
        })
    })


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


