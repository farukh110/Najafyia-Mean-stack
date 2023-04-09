(function () {

    angular.module('mainApp').controller('representativeController', RepresentativeController);

    function RepresentativeController($scope, $sce, $state, $window, $location, $filter, multipartForm, representativeService, countryService, $translate) {

        var repVM = this;
        repVM.details = null;
        repVM.countryList = [];
        repVM.socialMedia = {};
        repVM.socialMediaList = [];
        repVM.representativeList = [];
        repVM.editRow = false;
        repVM.imegeURL = null;
        repVM.file = {};
        repVM.getRepresentative = getRepresentative;
        repVM.getRepresentativeById = getRepresentativeById;
        repVM.saveRepresentative = saveRepresentative;
        repVM.deleteRepresentative = deleteRepresentative;
        repVM.ChangeRepresentativeStatus = ChangeRepresentativeStatus;
        repVM.addSocialMedia = addSocialMedia;
        repVM.deleteSocialMedia = deleteSocialMedia;
        repVM.search = search;
        repVM.OpenEditPage = OpenEditPage;
        repVM.resetForm = resetForm;
        repVM.dtOptions = {
            paging: false,
            "ordering": true,
            "Searching": true
            //responsive: true,



        };

        repVM.queryDetails = {
            country: null,
            city: null
        }
        repVM.queryDetails.city = undefined;
        repVM.queryDetails.country = undefined;


        countryService.getCountryList().then(function (response) {
            repVM.countryList = response.data || [];
            $scope.countryList = repVM.countryList.map(c => {
                if (localStorage.getItem('lang') === 'FRN') {
                    c.name = c.nameFRN;
                } else if (localStorage.getItem('lang') === 'ARB') {
                    c.name = c.nameARB;
                }
                return c;
            })
        });


        // representativeService.getCities().then(function (result) {
        //     if (result.status == 200) {
        //         $scope.citiesList = result.data;
        //     }
        // });

        $scope.countryChange = function (country) {
            repVM.queryDetails.city = null;
            $scope.cities = [];
            if (country) {

                // var cities = $filter('filter')($scope.citiesList, { 'country': country.alpha2 });
                // $scope.cities = cities || [];
                // $scope.cities = $scope.cities.sort((a, b) => {
                //     if (a.name < b.name) { return -1; }
                //     if (a.name > b.name) { return 1; }
                //     return 0;
                // })
                $scope.country = country.name;
            }
        }

        function getRepresentative(showActiveOnly) {
            console.log("&&&&&&&&load")
            var lang = localStorage.getItem('lang');
            representativeService.getRepresentative(lang, showActiveOnly).then(function (response) {
                repVM.representativeList = response.data.sort((a, b) => a.country > b.country ? 1 : -1);
                repVM.representativeList = repVM.representativeList;
                repVM.representativeListFiltered = repVM.representativeList;
            });
        }

        $scope.$watch('repVM.file', function (newValue, oldValue, scope) {
            //Do anything with $scope.letters
            const type = newValue && newValue.type;
            if (type && type.indexOf('image') < 0) {
                swal(
                    'Not Allowed!',
                    'Wrong Image Format',
                    'error'
                );
                let el = angular.element('#file');
                el[0].value = '';
                repVM.file = undefined;
            }

        });
        function getRepresentativeById() {
            var id = $location.search().id;
            var countryObject = [];
            var lang = localStorage.getItem('lang');
            if (id) {
                representativeService.getRepresentativeById(id, lang).then(function (res) {
                    repVM.details = res.data;
                    repVM.editRow = true;
                    // countryObject = $filter('filter')($scope.countryList, {'name': repVM.details.country});
                    countryService.getCountryList().then(function (response) {
                        repVM.countryList = response.data || [];
                        $scope.countryList = repVM.countryList.map(c => {
                            if (localStorage.getItem('lang') === 'FRN') {
                                c.name = c.nameFRN;
                            } else if (localStorage.getItem('lang') === 'ARB') {
                                c.name = c.nameARB;
                            }
                            return c;
                        })
                        // repVM.details.country = _.find(repVM.countryList, { 'name': repVM.details.country });
                    });
                    // representativeService.getCities().then(function (result) {
                    //     if (result.status == 200) {
                    //         $scope.citiesList = result.data;
                    //         $scope.countryChange(repVM.details.country);
                    //     }
                    // });
                    repVM.imegeURL = res.data.image;
                    jQuery('input[type=file]').val('');
                    repVM.socialMediaList = res.data.socialMedia;
                    return res;
                });
            } else {
                repVM.resetForm();
            }
        }
        function imageChange() {
            var typ = document.getElementById("file").value;
            var res = typ.match(".jp");

            if (!res) {
                alert("Sorry only jpeg images are accepted");
            }
        }
        function saveRepresentative(isValid) {
            if (isValid) {
                repVM.details.language = localStorage.getItem('lang');
                if (repVM.socialMediaList.length > 0) {
                    repVM.details.socialMedia = repVM.socialMediaList;
                }
                if (repVM.file.name == undefined) {
                    repVM.details.image = repVM.imegeURL;
                    // repVM.details.country = $scope.country;
                    representativeService.saveRepresentative(repVM.details).then(function (response) {
                        $state.go('representativeList');
                        if (response.status == 200) {
                            repVM.resetForm();
                            swal(
                                $translate.instant('Success!'),
                                response.data,
                                'success'
                            );
                        } else {
                            swal(
                                'Failed!',
                                'Failed to save',
                                'error'
                            )
                        }
                    })
                } else {
                    //upload image than save
                    multipartForm.post('/upload', repVM.file).then(function (res) {
                        repVM.details.image = res.data.name;
                        // repVM.details.country = $scope.country;
                        representativeService.saveRepresentative(repVM.details).then(function (response) {
                            $state.go('representativeList');
                            if (response.status == 200) {
                                repVM.resetForm();
                                swal(
                                    $translate.instant('Success!'),
                                    response.data,
                                    'success'
                                );
                            } else {
                                swal(
                                    'Failed!',
                                    'Failed to save',
                                    'error'
                                )
                            }
                        });
                    })
                }
            } else {
                swal(
                    'Form Invalid!',
                    'please fill out the missing fields',
                    'error'
                );
            }
        }

        function deleteRepresentative(id) {
            if (id) {


                swal({
                    title: "Delete this representative?",
                    text: "Are you sure? You won't be able to revert this!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "Yes, Delete it!"
                }).then((result) => { // <--
                    if (result.value) { // <-- if confirmed
                        representativeService.deleteRepresentative(id).then(function (response) {
                            if (response.status == 200) {
                                repVM.getRepresentative(false);
                                swal(
                                    $translate.instant('Success!'),
                                    response.data,
                                    'success',

                                );
                            } else {
                                swal(
                                    'Failed!',
                                    'Failed to delete',
                                    'error'
                                )
                            }
                        });
                    }

                });







            }
        }

        function ChangeRepresentativeStatus(id) {
            //  change rep status and register router and node api 
            representativeService.ChangeRepresentativeStat(id).then(function (response) {
                if (response.status == 200) {
                    repVM.getRepresentative(false);
                    swal(
                        $translate.instant('Success!'),
                        response.data,
                        'success'
                    );
                } else {
                    swal(
                        'Failed!',
                        'Failed to change status',
                        'error'
                    )
                }
            });

        }
        function addSocialMedia() {
            if (repVM.socialMedia.socialMedia != null && repVM.socialMedia.link != null) {
                repVM.socialMediaList.push(repVM.socialMedia);
                repVM.socialMedia = {};
            }
        }

        function deleteSocialMedia(idx) {
            if (idx != null) {
                repVM.socialMediaList.splice(idx, 1);
            }
        }

        function search() {
            console.log("&&&&&&&&search")
            if (!repVM.queryDetails.city)
                $scope.cities = [];
            if (!repVM.queryDetails.country) {
                repVM.representativeListFiltered = repVM.representativeList;
                $scope.cities = [];
                repVM.queryDetails.city = null;
            }
            repVM.representativeList.forEach(item => {
                if (!_.isEmpty(repVM.queryDetails.country) && !_.isEmpty(repVM.queryDetails.city)) {
                    item.isVisible = item.country == repVM.queryDetails.country.name && item.city == repVM.queryDetails.city;
                }
                else if (!_.isEmpty(repVM.queryDetails.country.name)) {
                    if (item.country == repVM.queryDetails.country.name) {
                        if ($scope.cities.indexOf(item.city) < 0) {
                            $scope.cities.push(item.city)
                        };
                        item.isVisible = true;
                    }
                    else
                        item.isVisible = false;
                } else if (!_.isEmpty(repVM.queryDetails.city)) {
                    item.isVisible = item.city == repVM.queryDetails.city;

                } else {
                    item.isVisible = true;
                }
            });
            repVM.representativeListFiltered = repVM.representativeList;
        }
        function OpenEditPage(id) {
            let url = '#/admin/addRepresentative?id=' + id;
            $window.location.href = url;
        }


        function resetForm() {
            repVM.details = null;
            repVM.editRow = false;
            repVM.socialMedia = {};
            repVM.socialMediaList = [];
            repVM.file = {};
            repVM.imegeURL = null;
        }
    }
})()