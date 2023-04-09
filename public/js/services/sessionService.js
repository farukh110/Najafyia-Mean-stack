angular.module('mainApp').service('SessionService', function () {
    var userIsAuthenticated = false;
    //     var userRights={
    // userid:'',

    //     }
    var userid;
    var username;
    var role;
    this.setCurrentUser = function (user) {
        this.userid = user._id;
        this.role = user.role;
        this.username = user.userName;
    }
    this.setUserAuthenticated = function (user, value) {
        userIsAuthenticated = value;
        if (user != null && user != undefined) {
            this.setCurrentUser(user);
        }

    };
    this.disposeUser = function () {
        this.userid = null;
        this.role = null;
        this.username = null;
    }
    this.getUserAuthenticated = function () {
        return userIsAuthenticated;
    }
    this.getCurrentUser = function () {

        // let obj = new Object;
        // obj.userid = this.userid;
        // obj.username = this.username;
        // obj.role = this.role;
        // return obj;
    }
});
