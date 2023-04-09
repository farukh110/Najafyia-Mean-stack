angular.module('filters', [])
    .filter('toTime', function () {
        return function (time) {
            var out;
            time = time.replace("#", '');
            out = time;
            if (time.length < 5) {
                out = "0" + time;
            }
            out = out.substring(0, 2) + ":" + out.substring(2, 4) + " " + out.substring(4, 5) + "m";

            return out;
        }
    })
    .filter('toDate', function () {
        return function (date) {
            var out;
            out = date;
            out = out.substring(0, 2) + " " + out.substring(2, out.length);
            return out;
        }
    })
    .filter('toTime24', function () {
        return function (time) {

            var out;
            time = time.replace("#", '');
            out = time;
            if (time.length < 5) {
                out = "0" + time;
            }
            out = out.substring(0, 2) + ":" + out.substring(2, 4) + " " + out.substring(4, 5) + "m";

            var hours = Number(out.match(/^(\d+)/)[1]);
            var minutes = Number(out.match(/:(\d+)/)[1]);
            var AMPM = out.match(/\s(.*)$/)[1];
            if (AMPM == "pm" && hours < 12) hours = hours + 12;
            if (AMPM == "am" && hours == 12) hours = hours - 12;
            var sHours = hours.toString();
            var sMinutes = minutes.toString();
            if (hours < 10) sHours = "0" + sHours;
            if (minutes < 10) sMinutes = "0" + sMinutes;
            out = sHours + ':' + sMinutes;
            return out;
        }
    })
    .filter('formatTime12', function () {
        return function (time) {
            var date = new Date(time);
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        };
    })
    .filter('formatTime122', function () {
        return function (time) {
            var d = new Date(time);
            var ampm = (d.getHours() >= 12) ? "PM" : "AM";
            var hours = (d.getHours() >= 12) ? d.getHours() - 12 : d.getHours();
            return hours + ' : ' + d.getMinutes() + ' ' + ampm;
        };
    })
    .filter('camelCase', function () {
        return function (str) {
            if (str) {
                var str = str.replace(/_/g, " ");
                return str.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
        };
    })
    .filter('flightType', function () {
        return function (str) {
            var result = null;
            if (str == 'ROUND_TRIP') {
                result = 'Round Trip';
            } else if (str == 'ONEWAY') {
                result = 'One Way';
            } else if (str == 'MULTI_CITY') {
                result = 'Multi City';
            } else {
                result = str;
            }
            return result;
        }
    })
    .filter('flightClass', function () {
        return function (str) {
            var result = null;
            if (str == 'ECONOMY') {
                result = 'Economy';
            } else if (str == 'BUSINESS') {
                result = 'Business';
            } else if (str == 'FIRST_CLASS') {
                result = 'First Class';
            } else {
                result = str;
            }
            return result;
        }
    })
    .filter('passengerType', function () {
        return function (str) {
            var result = null;
            if (str == 'ADT') {
                result = 'Adult';
            } else if (str == 'CHD') {
                result = 'Child';
            } else if (str == 'INF') {
                result = 'Infant';
            } else {
                result = str;
            }
            return result;
        }
    })
    .filter('beautifyString', function () {
        return function (str) {
            return result = str.substring(1, str.length - 1);
        }
    })
    .filter('time12', function () {
        return function (time) {
            var time = new Date(time);
            var hours = time.getHours() > 12 ? time.getHours() - 12 : time.getHours();
            var am_pm = time.getHours() >= 12 ? "PM" : "AM";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
            var seconds = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
            //time = hours + ":" + minutes + ":" + seconds + " " + am_pm;.
            time = hours + ":" + minutes + ":" + am_pm;
            return time;
        }
    })
    .filter('iconType', function () {
        return function (type) {
            if (type) {
                var icon = "";
                type = type.toUpperCase();
                switch (type) {
                    case 'FACEBOOK':
                        icon = 'fa-facebook-square';
                        break;
                    case 'TWITTER':
                        icon = 'fa-twitter';
                        break;
                    case 'INSTAGRAM':
                        icon = 'fa-instagram';
                        break;
                    case 'EMAIL':
                        icon = 'fa-envelope-o';
                        break;
                    case 'YOUTUBE':
                        icon = 'fa-youtube';
                        break;
                    default:
                        break;
                }
                return icon;
            }
            return icon;
        }
    })
    .filter('iconImage', function () {
        return function (type) {
            if (type) {
                var icon = "";
                type = type.toUpperCase();
                switch (type) {
                    case 'FACEBOOK':
                        icon = 'fb';
                        break;
                    case 'GOOGLE':
                        icon = 'gplus';
                        break;
                    case 'INSTAGRAM':
                        icon = 'insta';
                        break;
                    case 'YOUTUBE':
                        icon = 'youtube';
                        break;
                    default:
                        break;
                }
                return icon;
            }
            return icon;
        }
    })
    .filter('serviceImg', function () {
        return function (str) {
            return str.replace(/[^a-zA-Z ]/g, "").toUpperCase();
        }
    }).filter('krReceipt', function () {
    return function (list) {
        var name = jQuery("#kRecpNameFilter").val();
        var invNo = jQuery("#kRecpInvNoFilter").val();
        var marjaeenName = jQuery("#kRecpMarjaenNameFilter").val();
        var dateFilter = jQuery("#kDateFilter").val();
        var amount = jQuery("#kAmountFilter").val();

        if (name == "" && invNo == '' && marjaeenName == '' && dateFilter == '' && amount == '') {

            return list;
        }
        else {
            var listArray = [];

            list.forEach(function (listObj) {
                if (invNo != "") {
                    if (listObj.invoiceNo.toLowerCase().search(invNo.toLowerCase()) == 0) {
                        listArray.push(listObj)
                    }
                }
                if (name != "") {
                    listObj.donor.forEach(function (listForDonor) {
                        if (listForDonor.donarName.toLowerCase().search(name.toLowerCase()) == 0) {
                            listArray.push(listObj)
                        }
                    });
                }
                if (marjaeenName != "") {
                    listObj.donationdetails.forEach(function (listOfDonationDetails) {
                        listOfDonationDetails.programSubCategory.forEach(function (listForProgramSubCategoryName) {
                            if (listForProgramSubCategoryName.programSubCategoryName.toLowerCase().search(marjaeenName.toLowerCase()) == 0) {
                                listArray.push(listObj);
                            }
                        })
                    });
                }
                if (dateFilter != "") {
                    if (((new Date(listObj.created).getDate() + "." + (new Date(listObj.created).getMonth() + 1) + "." + new Date(listObj.created).getFullYear())).search(dateFilter.replace(/\b0(?=\d)/g, '')) == 0) {
                        listArray.push(listObj)
                    }
                }
                if (amount != "") {
                    if (amount.toLowerCase().search("u")==0||amount.toLowerCase().search("us")==0||amount.toLowerCase().search("usd")==0){
                        amount = "$";
                    }
                    if (amount.toLowerCase().search("e")==0||amount.toLowerCase().search("eu")==0||amount.toLowerCase().search("eur")==0||amount.toLowerCase().search("euro")==0){
                        amount = "€";
                    }
                    if (amount.toLowerCase().search("g")==0||amount.toLowerCase().search("gb")==0||amount.toLowerCase().search("gbp")==0){
                        amount = "£";
                    }
                    if (listObj.totalAmount.toString().search(amount) == 0) {
                        listArray.push(listObj)
                    }
                    if (listObj.currency == amount ) {
                        listArray.push(listObj)
                    }

                }
            });

            return listArray;

        }

    }
}).filter('reciptFilter', function () {
    return function (list) {

        var name = jQuery("#RecpNameFilter").val();
        var invNo = jQuery("#RecpInvNoFilter").val();
        var category = jQuery("#RecpCateoryFilter").val();
        var dateFilter = jQuery("#DateFilter").val();
        var amount = jQuery("#AmountFilter").val();


        if (name == "" && category == '' && invNo == '' && dateFilter == '' && amount == '') {

            return list;
        }
        else {
            var listArray = [];

            list.forEach(function (listObj) {
                if (invNo != "") {
                    if (listObj.invoiceNo.search(invNo) == 0) {
                        listArray.push(listObj)
                    }
                }
                if (name != "") {
                    listObj.donor.forEach(function (listForDonor) {
                        if (listForDonor.donarName.toLowerCase().search(name) == 0) {
                            listArray.push(listObj)
                        }
                    });
                }
                if (category != "") {
                    listObj.donationdetails.forEach(function (listOfDonationDetails) {
                        listOfDonationDetails.program.forEach(function (listForProgramSubCategoryName) {
                            if (listForProgramSubCategoryName.programName.toLowerCase().search(category) == 0) {
                                listArray.push(listObj);
                            }
                        })
                    })
                }
                if (dateFilter != "") {
                    if (((new Date(listObj.created).getDate() + "." + (new Date(listObj.created).getMonth() + 1) + "." + new Date(listObj.created).getFullYear())).search(dateFilter.replace(/\b0(?=\d)/g, '')) == 0) {
                        listArray.push(listObj)
                    }
                }

                if (amount != "") {
                    if (amount.toLowerCase().search("u")==0||amount.toLowerCase().search("us")==0||amount.toLowerCase().search("usd")==0){
                        amount = "$";
                    }
                    if (amount.toLowerCase().search("e")==0||amount.toLowerCase().search("eu")==0||amount.toLowerCase().search("eur")==0||amount.toLowerCase().search("euro")==0){
                        amount = "€";
                    }
                    if (amount.toLowerCase().search("g")==0||amount.toLowerCase().search("gb")==0||amount.toLowerCase().search("gbp")==0){
                        amount = "£";
                    }
                    if (listObj.totalAmount.toString().search(amount) == 0) {
                        listArray.push(listObj)
                    }
                    if (listObj.currency == amount) {
                        listArray.push(listObj)
                    }
                }
            })
            return listArray;

        }


    }
})