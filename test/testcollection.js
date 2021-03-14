let envPath = __dirname + "/../.env";               // "hack" our env path
require('dotenv').config({path:envPath});    // process.env.SECRET_KEY will have a value
let chai = require('chai') ;                        // require 'chai'
let chaiHttp = require('chai-http');                // require 'chai-http' to call our web service
let server = require('../server');                  // require our server.js file
let User = require('../Users');

var token = '';
chai.should();
chai.use(chaiHttp);        // tell chai to use chaihttp so it can call webservices


let login_details = {
    name : 'testtt',
    username : 'ethanaaa',
    password : 'badGuyyyy'
}

let movie_details = {
    title : 'qq',
    release : '1998',
    genre : 'Horror',
    characters : []
}
movie_details.characters.push({
    characterName:'vonathan',
    actorName:'anathan'
});



    describe('/signup', () => {
        it('it should register, login and check our token', (done) => {   // what should 'it' do
            chai.request(server)                            // do a chai request on our server
                .post('/signup')                            // do a post to 'signup'
                .send(login_details)                        // send our login details
                .end((err, res) =>{                         // should return error or response
                    console.log(JSON.stringify(res.body))
                    // res.should.have.status(200)                 // check if status is 200
                    // res.body.success.should.be.eql(true);       // should have a body
                })
        })
    })

    describe('/signin', () => {
        it('will check our log in info', (done) => {   // what should 'it' do
            chai.request(server)// do a chai request on our server
                .post('/signin')                            // do a post to 'signup'
                .send(login_details)                        // send our login details
                .end((err, res) =>{                         // should return error or response
                    console.log(JSON.stringify(res.body))
                    // res.should.have.status(200)                 // check if status is 200
                    // res.body.success.should.be.eql(true);       // should have a body
                    if(res.body.msg !== 'Authentication failed.') {
                        token = res.body.token;
                    }
                    done();
                })
        })
    })

    //adds a movie to the database
    describe('/moviecollection', () => {
        it('adds a movie to the database', (done) => {
            chai.request(server)
                .post('/moviecollection')
                .set('Authorization', token)
                .send(movie_details)
                .end((err, res) =>{
                    console.log(JSON.stringify(res.body))
                    // res.should.have.status(200)                 // check if status is 200
                    // res.body.success.should.be.eql(true);       // should have a body
                    done();
                })
        })
    })

    // delets a movie from a database
    describe('/moviecollection', () => {
        it('deletes a movie from a database', (done) => {   // what should 'it' do
            chai.request(server)// do a chai request on our server
                .delete('/moviecollection')                            // do a post to 'signup'
                .set('Authorization', token)
                .send(movie_details)                                        // send our login details
                .end((err, res) =>{                         // should return error or response
                    console.log(JSON.stringify(res.body))
                    // res.should.have.status(200)                          // check if status is 200
                    // res.body.success.should.be.eql(true);                // should have a body
                    done();
                })
        })
    })

    // returns a movie from a database
    describe('/moviecollection', () => {
        it('adds a movie to the database', (done) => {
            chai.request(server)// do a chai request on our server
                .get('/moviecollection')
                .set('Authorization', token)
                .send(movie_details)
                .end((err, res) =>{                         // should return error or response
                    console.log(JSON.stringify(res.body))
                    // res.should.have.status(200)                 // check if status is 200
                    // res.body.success.should.be.eql(true);       // should have a body
                    done();
                })
        })
    })

    //updates a movie in the database
    describe('/moviecollection', () => {
        it('updates a movie in the database', (done) => {
            chai.request(server)// do a chai request on our server
                .put('/moviecollection')                            // do a post to 'signup'
                .set('Authorization', token)
                .send(movie_details)                        // send our login details
                .end((err, res) =>{                         // should return error or response
                    console.log(JSON.stringify(res.body))
                    // res.should.have.status(200)                 // check if status is 200
                    // res.body.success.should.be.eql(true);       // should have a body
                    done();
                })
        })
    })


// describe('/signup', () => {
    //     it('it should register, login and check our token', (done) => {   // what should 'it' do
    //         chai.request(server)                            // do a chai request on our server
    //             .post('/signup')                            // do a post to 'signup'
    //             .send(login_details)                        // send our login details
    //             .end((err, res) =>{                         // should return error or response
    //                 console.log(JSON.stringify(res.body))
    //                 res.should.have.status(200)                 // check if status is 200
    //                 res.body.success.should.be.eql(true);       // should have a body
                    // chai.request(server)                             // do a nother chai request
                    //     .post('/signin')                             // send a post to 'signin'
                    //     .send(login_details)                         // send login_details
                    //     .end((err,res)=>{                            // should return error or response
                    //         res.should.have.status(200)              // check if status is 200
                    //         res.body.should.have.property('token');  // make sure youre getting a token back
                    //         let token = res.body.token;
                    //         console.log(token)

                            // chai.request(server)                // call a server reqest on our server
                            //     .put('/testcollection')         // do a put from /testcollection
                            //     .set('Authorization', token)    // set authorization token to token
                            //     .send({echo: ''})               // set echo to ''
                            //     .end((err,res) =>{              // should return error or response
                            //         res.should.have.status(200)        // should have a 200 status
                            //         res.body.should.have.property('echo')  // should have a body
                            //         done();
                            //     })
//                         })
//                 })
//         });
//     })
// })
