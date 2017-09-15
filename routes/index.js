var express = require('express');
var router = express.Router();
var passport = require('passport');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql12.freemysqlhosting.net',
    user     : 'sql12194671',
    password : 'aeTS8bpsub',
    database : 'sql12194671'
});

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//GET Register page
router.get('/register', function(req, res, next) {
    res.render('register');
});

router.get('/login', function(req, res, next) {
    res.render('login');
});


//POST doRegister
router.post('/doRegister', function(req, res, next) {
    var username = req.body.txtUsername;
    var password = req.body.txtPassword;
    var email = req.body.txtEmail;
    var gender = req.body.gender;

    var sql = "INSERT INTO users VALUES(?,?,?,?,?)";
    var values = [null,username, password, email, gender];

    connection.query(sql, values, function (err, results) {
        //jalan ketika query dilakukan
        if(err){
            console.log(err);
            throw err;
        }
        return res.redirect('/');
    });
});

router.post('/doLogin', function(req, res, next) {
    //email/username password correct
    var credential = req.body.txtCredential;
    var password = req.body.txtPassword;

    var sql = "SELECT * FROM users WHERE(username = ? or email = ?) AND password=?";
    var values = [credential,credential, password];
    connection.query(sql, values, function (err,results) {
       if(err){
           console.log(err);
           throw err;
       }
       if(results.length == 0){
           return res.redirect('/login');
       }

       //session
       req.session.user = results[0];

       return res.redirect('/home');
    });
});

var authMiddleware = function(req, res, next) {
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
};

router.get('/home', authMiddleware, function(req, res, next) {

    res.render('home', {user: req.session.user});
});

router.get('/logout', function(req, res, next) {
    //hapus semua session
    req.session.destroy();
    //misalnya hapus yg user aja
    //req.session.destroy('user');
    res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] })); //scope untuk jadi permission agar bisa diambil emailnya

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    //req.session.user = req.user; //simpen hasil dari API facebook ke session
    //return res.redirect('/home'); //lgsung redirect ke halaman home ketika sudah berhasil login

    //cek email di fb terdaftar atau blm
    var sql = "SELECT * FROM users WHERE Email = ?";
    var values = [req.user.emails[0].values];

    connection.query(sql, values, function (err, results) {
        if(err){
            console.log(err);
            throw err;
        }
        if(results.length == 0){
            req.session.email = req.user.emails[0].values;

            return res.redirect('/register');
        }

        req.session.user = results[0];
        return res.redirect('/home');
    });

    console.log(req.user);
    return res.send(req.user);
});


module.exports = router;
