var express = require('express');
var bodyParser = require('body-parser')
var path = require('path')
var moment = require('moment');
var _ = require('underscore')
var mongoose = require('mongoose')
var Movie = require('./models/movie')
var User = require('./models/user')
var port = process.env.PORT || 3000
var app = express()

mongoose.connect('mongodb://localhost/imooc')

app.locals.moment = moment;

app.set('views', './views/pages')
app.set('view engine', 'jade')
//重要
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.listen(port)

console.log('imooc started on port ' + port)

// index page
app.get('/', function(req, res) {
    Movie.fetch(function(err, movies){
        if (err){
            console.log(err)
        }
        res.render('index', {
            title: 'imooc 首页',
            movies: movies
        })
    })
})

// signup

app.post('/user/signup', function(req, res) {
    var _user = req.body.user

    User.findOne({name: _user.name}, function(err, user) {
        if(err) {
            console.log(err)
        }
        if (user) {
            console.log(user)
            return res.redirect('/')
        } else {
            var user = new User(_user);
            user.save(function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/userlist');
                }
            })
        }
    })
})
// req.param('user'))
// param->query->body
//
app.post('/user/signin', function(req, res) {
     var _user = req.body.user;
     var name = _user.name;
     var password = _user.password;

     User.findOne({name: name}, function(err, user) {
         if(err) {
             console.log(err);
         }
         if(!user) {
             return res.redirect('/');
         }

         user.comparePassword(password, function(err, isMatch) {
             if(err){
                 console.log(err);
             }
             if(isMatch) {
                 console.log('Password is matched')
                 return res.redirect('/');
             } else {
                 console.log('Password is not matched')
             }
         })
     })
})

// userlist
app.get('/userlist', function(req, res) {
    User.fetch(function(err, users){
        if (err){
            console.log(err)
        }
        res.render('userlist', {
            title: 'imooc 列表页',
            users: users
        })
    })
})
// detail page

app.get('/movie/:id', function(req, res) {
    var id = req.params.id

    // 我不知道为什么，不能用字符串搜索而必须用ObjectId
    // 所以我还是用一种奇葩的方式搞定了。。。
    Movie.findById(mongoose.Schema.ObjectId(id), function(err, movie){
        if(movie){
            res.render('detail', {
                title: 'imooc ' + movie.title,
                movie: movie
            })
        } else {
            res.redirect('/');
        }
    })
})

app.get('/admin/movie', function(req, res) {
    res.render('admin', {
        title: 'imooc 后台页面',
        movie: {
            doctor: '',
            country: '',
            title: '',
            year: '',
            poster: '',
            language: '',
            flash: '',
            summary: ''
        }
    })
})

// admin update movie
app.get('/admin/update/:id', function(req, res) {
    var id = req.params.id

    if(id){
        Movie.findById(mongoose.Schema.ObjectId(id), function(err, movie){
            res.render('admin', {
                title: 'immoc 后台更新页',
                movie: movie
            })
        })
    }
})

// admin post movie
app.post('/admin/movie/new', function(req, res){
    var id = req.body.movie._id
    //console.log(req.body)
    var movieObj = req.body.movie
    var _movie

    if (id != 'undefined') {
        Movie.findById(mongoose.Schema.ObjectId(id), function(err, movie){
            if(err) {
                console.log(err)
            }

            _movie = _.extend(movie, movieObj)
            _movie.save(function(err, movie){
                if(err) {
                    console.log(err)
                }

                res.redirect('/movie/' + movie._id)
            })
        })
    } else {
        _movie = new Movie({
            doctor: movieObj.doctor,
            title : movieObj.title,
            country : movieObj.country,
            language : movieObj.doctor,
            year : movieObj.year,
            poster : movieObj.poster,
            summary : movieObj.summary,
            flash : movieObj.flash
        })

        _movie.save(function(err, movie){
            if(err) {
                console.log(err)
            }

            res.redirect('/movie/' + movie._id)
        })
    }
})

// list page
app.get('/admin/list', function(req, res) {
    Movie.fetch(function(err, movies){
        if (err){
            console.log(err)
        }
        res.render('list', {
            title: 'imooc 列表页',
            movies: movies
        })
    })
})

// list delete movie
app.delete('/admin/list', function(req, res) {
    var id = req.query.id
    //console.log(id)
    if(id) {
        Movie.remove({_id: mongoose.Schema.ObjectId(id)}, function(err, movie){
            if(err) {
                console.log(err)
            }
            res.json({success: 1})
        })
    }
})
