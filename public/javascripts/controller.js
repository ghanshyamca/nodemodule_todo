var app = angular.module("todoApp", ['ngCookies']);


app.controller('todoRegister', function($scope, $http) {


    $scope.onSubmit = function() {
        console.log("inside registeration form");
        var data = {
            "name": $scope.uname,
            "email": $scope.email,
            "pass": $scope.pass
        };
        $http.post('/register', data).success(function(response) {
                console.log("Inside the register success function");
            })
            .error(function(data, status) {
                console.error('Register Repos error', status, data);
            });

    };
});




app.controller('todoLogin', ['$cookies', '$scope', '$http', function($cookies, $scope, $http) {
    console.log('test');


    $scope.onLogin = function() {
        console.log("inside login");
        var data = {
            "email": $scope.email,
            "pass": $scope.pass
        };
        console.log($scope.email, $scope.pass);
        $http.post('/login', data).success(function(response) {
                console.log("Inside the login function");
                $scope.cookname = $cookies.get('authtoken');
                console.log($scope.uuid);
                console.log(response);

                window.location = "/task";

            })
            .error(function(data, status) {
                console.error('Register Repos error', status, data);
            });
    };

}]);

app.controller('taskAddCtrl', ['$cookies', '$scope', '$http', function($cookies, $scope, $http) {
    $scope.show = true;
    $scope.sharetask = true;
    $scope.uuid = $cookies.get('uidd');
    var refresh = function() {
        $scope.tname = "";
        $scope.tdesc = "";

    };

    $http.post('/gettask').success(function(response) {
            $scope.tasklist = response
            console.log($scope.tasklist);
        })
        .error(function(data, status) {
            console.log(data, status);
        });

    $scope.logout = function() {
        console.log("logout doing");

        $http.get('/logout').success(function(response) {
                console.log("logout successful");
                window.location = "/";

            })
            .error(function(data, status) {
                console.error("logout unsuccessful");

            })
    };

    $scope.taskAdd = function() {

        console.log("taskAdd");

        var data = {
            "tname": $scope.tname,
            "tdesc": $scope.tdesc
        };
        $http.post("/taskAdd", data).success(function(response) {
                console.log("task Added successful");

                $scope.tasklist.unshift(response)
                console.log(response);
                refresh();

            })
            .error(function(data, status) {
                console.error("Not Added task");
            })
    };
    $scope.status = function(uid, status) {
        console.log(uid + "  " + status)

        var data = {

            "uid": uid,
            "status": status
        };

        $http.post('/updatestatus', data)
            .success(function(response) {
                console.log("status updated successful");
                console.log(response);
            })
            .error(function(data, status) {
                console.error("Not updated status");
            });


    };
    $scope.taskEdit = function(uid, name, desc) {
        console.log(uid + " " + name + " " + desc);
        var data = {
            "uid": uid,
            "name": name,
            "desc": desc
        };

        $http.post('/taskEdit', data)
            .success(function(response) {
                console.log("task edited successful");
                console.log(response);
            })
            .error(function(data, status) {
                console.error("Not task edited");
            })



    };
    $scope.taskDelete = function(uid, index) {
        console.log(uid + " " + index);

        $http.post('/taskDelete/' + uid)
            .success(function(response) {

                if (response.success) {
                    $scope.tasklist.splice(index, 1);
                } else {
                    console.log("unsuccessful");
                }

            })
            .error(function(data, status) {
                console.error("Not deleted task")
            })

    };

    $scope.share = function(uid) {
        var objectid = uid;
        $http.post('/share/' + uid)
            .success(function(response) {
                $scope.userlist1 = response;
                console.log(response)

            })
            .error(function(data, status) {

            })



        $scope.refer = function(ruid) {
            console.log(ruid);
            var data = {
                "ruid": ruid,
                "uid": uid
            }

            $http.post('/refer', data)
                .success(function(response) {
                    console.log(response);

                })
                .error(function(data, status) {

                })



        }
    };




}]);

app.controller('todoforgot', function($scope, $http) {

    $scope.onforgot = function() {
        $http.post('/passreset/' + $scope.femail).success(function(response) {
                console.log(response);
            })
            .error(function(data, status) {
                console.error("reset unsuccessful");
            })

    };

    $scope.onResetPass=function(){
    	token=location.pathname.split('/')[2];
    	var data={
    		'pass':$scope.pass,
    		'cpass':$scope.cpass,
    		'token':token
    	}
    	$http.post('/resetpassword',data)
    	.success(function(response){
    		console.log(response.status);
    		window.location="/";


    	})
    	
    }



});
