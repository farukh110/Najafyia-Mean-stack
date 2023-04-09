(function () {

    angular.module('mainApp').controller('notificationController', NotificationController);

    function NotificationController($scope, $stateParams, $location, receiptService, $filter, $state, fileUpload, multipartForm, donationService) {

        if (!firebase.apps.length) {
            var config = {
                apiKey: "AIzaSyDeZI4idWEJguH5t4-QPxh__gA2ZHFWyik",
                authDomain: "al-najafiya-4b042.firebaseapp.com",
                databaseURL: "https://al-najafiya-4b042.firebaseio.com",
                projectId: "al-najafiya-4b042",
                storageBucket: "al-najafiya-4b042.appspot.com",
                messagingSenderId: "1083185506965",
                appId: "1:1083185506965:web:e97040ef60198b4b6c099c",
                measurementId: "G-B48M5QD13Y"
            };
            firebase.initializeApp(config);
            var database = firebase.database().ref().child("messages");

        }

        else {
            var database = firebase.database().ref().child("messages");
        }
        function writeUserData(name, message) {
            database.push().set({
                username: name,
                message: message
            });
        }
        function renderUI(obj) {
            var html = '';
            obj = obj || {};
            if (Object.keys(obj).length !== 0 && obj.constructor !== Object) {
                var keys = Object.keys(obj);
                for (var i = 0; i < keys.length; i++) {
                    html += "<li><b><i>" + obj[keys[i]].username + "</i></b> says: " + obj[keys[i]].message + "</li>";
                }
                jQuery('#comment').html(html);
            }
        }
        jQuery('#btnGetMessage').click(function () {
            writeUserData($('#username').val(), $('#message').val());
            jQuery('#username').val('');
            jQuery('#message').val('');
        });
        database.on('value', function (snapshot) {
            renderUI(snapshot.val());
        });

        database.on('child_added', function (data) {
        });
        database.limitToLast(1).on('child_added', function (data) {
            if (true) {
                var notify;

                notify = new Notification('' + data.val().username, {
                    'body': data.val().message,
                    'icon': 'images/logo.png',
                    'tag': "<a ui-sref= '/home'>Click here</a>"

                });
                // notify.onclick = function () {
                //     $state.go('home')
                // }
                notify.onclick = function () {
                    window.open("https://localhost:8443/#/home");
                };
                //Delete Notification so that it will not apperar on page load.
                firebase.database().ref("messages").child(data.key).remove();
            } else {
                alert('Please allow the notification first');
            }
        });
    }
})();