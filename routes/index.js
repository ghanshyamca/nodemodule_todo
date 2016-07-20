var express = require('express');
var router = express.Router();
var built = require('built.io');
var builtApp = built.App('bltd37e74fwe70bdc2wew');
var user = builtApp.User();
var request = require('request');
var nodemailer = require("nodemailer");

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.cookies.uidd && req.cookies.authtoken) {

        res.render('task');
    } else {
        res.render('index', { title: 'Express' });
    }
});

router.post('/register', function(req, res, next) {
    user.register(req.body.email, req.body.pass, req.body.pass, {
            username: req.body.name
        })
        .then(function(user) {
            console.log(user.toJSON());
            res.end();
        });

});

router.post('/login', function(req, res, next) {

    user.login(req.body.email, req.body.pass)
        .then(function(user) {
            console.log("login successful");
            res.cookie("authtoken", user.data.authtoken);
            res.cookie("uidd", user.data.uid)
            res.json(user)
        });
});
router.get('/task', function(req, res, next) {
    if (req.cookies.uidd && req.cookies.authtoken) {

        res.render('task');
    } else {
        res.redirect('/');
    }
});

router.post('/gettask', function(req, res, next) {

    var Query = builtApp.Class('todo_task').Query;
    var query = Query();
    query = query.descending('created_at');
    query = query.includeOwner();
    query.toJSON().setHeader('authtoken', req.cookies.authtoken).exec()
        .then(function(query) {


            res.json(query);

        });
});

router.get('/logout', function(req, res, next) {

    console.log("inside logout");
    res.clearCookie('authtoken');
    res.clearCookie('uidd');
    res.send('success logout');

});

router.get('/forgotpass', function(req, res, next) {
    console.log("forgotpass");
    res.render('forgot');
})

router.post('/passreset/:emailid', function(req, res, next) {
    console.log(req.params.emailid);

    var email = req.params.emailid;
    user.fetchUserUidByEmail(req.params.emailid)
        .then(function(user) {
            console.log(user.data.uid);
            // res.json(user.data.uid)
            var userUID = user.data.uid;
            var options = {
                url: 'https://api.built.io/v1/application/users/' + userUID + '/token',
                headers: {
                    application_api_key: 'bltd3wewe7e74f70bdc2c76',
                    master_key: 'blt6a4918486erwqb626a20'
                }
            };
            request(options, function(err, res, body) {
                if (err) {
                    res.send(400, err)
                } else {
                    var token = JSON.parse(body);
                    sendMail(email, token.token);
                }
            })

        });
})
var sendMail = function(email, token) {
    var transporter = nodemailer.createTransport('smtps://nobitabean%40gmail.com:nobita1123@smtp.gmail.com');

    var mailOptions = {
        from: 'nobitabean@gmail.com', // sender address 
        to: email, // list of receivers 
        subject: 'Reset Your Password',
        // forceEmbeddedImages: true, // Subject line 
        html: '<html><body><span style="color:red">Hello</span><img style="display:block" width="150px" height="150px" src="https://raw.githubusercontent.com/gmetais/YellowLabTools/master/doc/img/npm-logo.png"/><h1>Reset Your Password<h1> <br> click on the link <a rel="nofollow" href="http://172.16.0.179:4041/resetpassword/' + token + '">Reset Password</a></body></html>',
    //     attachments: [{
    //     filename: 'logo.jpg',
    //     path: '/nodeTodo/todoApp/public/images/logo.jpg',
    //     cid: 'unique@kreata.ee' //same cid value as in the html img src
    // }] 
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent');

    });
}

router.get('/resetpassword/:token', function(req, res, next) {
    // console.log("forgotpass");
    res.render('resetpassword');
})
router.post('/resetpassword', function(req, res, next) {

    user.resetPassword(req.body.pass, req.body.cpass, req.body.token)
        .then(function() {
            // res.redirect('/')
            res.json({'status':true})
        });
})


router.post('/taskAdd', function(req, res, next) {
    console.log("taskAdd");
    var Project = builtApp.Class('todo_task').Object;
    var projectWithUid = Project({
        name: req.body.tname,
        description: req.body.tdesc

    });
    projectWithUid.setHeader('authtoken', req.cookies.authtoken).includeOwner().save()
        .then(function(object) {
            res.json(object);
        });
});

router.post('/updatestatus', function(req, res, next) {
    console.log("entering");
    var Project = builtApp.Class('todo_task').Object;
    var projectWithUid = Project({
        uid: req.body.uid,
        status: req.body.status
    });
    projectWithUid.
    setHeader('authtoken', req.cookies.authtoken).save()
        .then(function(object) {
            // $scope.hide=status;
            console.log("status updated");
            res.json(object);
        });

});

router.post('/taskEdit', function(req, res, next) {
    console.log("taskEdit entering");

    var Project = builtApp.Class('todo_task').Object;
    var projectWithUid = Project({
        uid: req.body.uid,
        name: req.body.name,
        description: req.body.desc

    });
    projectWithUid.setHeader('authtoken', req.cookies.authtoken).save()
        .then(function(object) {
            console.log("task  updated");
            res.json(object);
        }, function(object) {
            res.status(403).send("unsucessful");
        });

});

router.post('/taskDelete/:uid', function(req, res, next) {
    console.log("entering for delete" + req.params.uid)
    var project = builtApp.Class('todo_task').Object(req.params.uid);
    project
        .setHeader('authtoken', req.cookies.authtoken)
        .delete()
        .then(function(response) {
            console.log('object deleted successfully');
            res.json({ success: true });

        });
})

router.post('/share/:uid', function(req, res, next) {
    console.log("enter for share" + req.params.uid);
    var userid = [];
    var query = builtApp.Class("todo_task").Query();
    query = query.where('uid', req.params.uid)
    query.toJSON()
        .setHeader('authtoken', req.cookies.authtoken).exec()
        .then(function(data) {
            if (data[0].share) {

                userid = data[0].share;
                userid.push(req.cookies.uidd);
                console.log(userid);
            } else {
                userid.push(req.cookies.uidd);
                console.log(userid);
            }
            var query1 = builtApp.Class("built_io_application_user").Query();
            query1 = query1.notContainedIn('uid', userid)
            query1.toJSON().setHeader('authtoken', req.cookies.authtoken).exec()
                .then(function(data) {

                    res.json(data);
                });
        });


});

router.post('/refer', function(req, res, next) {
    console.log(typeof req.body.ruid);
    console.log(req.body.uid);
    var query = builtApp.Class('todo_task').Query();
    var projectWithUid
    
    query
    .setHeader('authtoken', req.cookies.authtoken)
    .where('uid', req.body.uid)
    .exec()
    .then(function(objects){
        projectWithUid = objects[0]
        var acl =  built.ACL(projectWithUid.get('ACL'))

         for (var i = 0; i < req.body.ruid.length; i++) {
            console.log(req.body.ruid[i])
            acl = acl.setUserReadAccess(req.body.ruid[i], true)
                .setUserUpdateAccess(req.body.ruid[i], true);


        }

        projectWithUid
        .setHeader('authtoken', req.cookies.authtoken)       
        .setACL(acl)
        .pushValue('share',req.body.ruid)
        .save()
        .then(function(object) {
            console.error("Refrences Added successfully");
            console.log(object.toJSON())
             res.json({ status: 'ok' });
        }, function(e) {
            console.log(e)
        });
    })




    /*var acl = built.ACL();
    var Bugs = builtApp.Class('built_io_application_user').Object;
    var Project = builtApp.Class('todo_task').Object;
    var projectWithUid = Project({
        uid: req.body.uid
    });
    for (var i = 0; i < req.body.ruid.length; i++) {
        console.log(req.body.ruid[i])
        acl = acl.setUserReadAccess(req.body.ruid[i], true)
            .setUserUpdateAccess(req.body.ruid[i], true);

          projectWithUid = projectWithUid.pushValue('share',req.body.ruid[i])
            

    }
        var bugs = Bugs();
        projectWithUid
            .setHeader('authtoken', req.cookies.authtoken)       
            .setACL(acl)
            .save()
            .then(function(object) {
                console.error("Refrences Added successfully");
                console.log(object.toJSON())
            }, function(e) {
                console.log(e)
            });
    res.json({ status: 'ok' });*/
});
module.exports = router;
