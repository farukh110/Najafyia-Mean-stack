(function () {

    angular.module('mainApp').controller('menuController', menuController);

    function menuController($rootScope, $scope, $state, $location, $translate, menuService, pageService, dynamicPageContentService, programService, pageContentService, sadaqaService, religiousPaymentService, donarService, currencyService, utilService, config) {
        var vm = this;
        var menuData = [];
        vm.allPagesList = [];
        vm.result = "";
        vm.menuId = "";
        vm.addRootMenu = addRootMenu;
        vm.changeLanguage = changeLanguage;
        vm.changeCurrency = changeCurrency;
        vm.addSubMenu = addSubMenu;
        vm.getMenus = getMenus;
        vm.getSubMenus = getSubMenus;
        vm.deleteMenu = deleteMenu;
        vm.deleteMenuLevel2 = deleteMenuLevel2;
        vm.deleteRootMenu = deleteRootMenu;
        vm.getmenuForUpdate = getmenuForUpdate;
        vm.menus = [];
        vm.menuList = [];
        vm.fillMenuList = fillMenuList;
        vm.getSubMunuList = getSubMunuList;
        vm.getSubMunuList2 = getSubMunuList2;
        vm.addRootNode = addRootNode;
        vm.LoadMainMenu = LoadMainMenu;
        vm.bindMenuModal = bindMenuModal;
        vm.SaveEdit = SaveEdit;
        vm.searchPage = searchPage;
        vm.bellNotification = bellNotification;
        vm.getAllDynamicPagesList = getAllDynamicPagesList;
        vm.mainMenuClick = mainMenuClick;
        vm.goPreviousMenu = goPreviousMenu;
        vm.childMenuClick = childMenuClick;
        vm.setActiveLink = setActiveLink;
        vm.saveActiveLink = saveActiveLink;
        vm.language = localStorage.getItem('lang');
        vm.currencies = [];
        function getAllCurrency() {
            let cur = [];
            currencyService.getCurrency(true).then(function (currencies) {

                if (currencies.data.length > 0) {
                    cur = currencies.data;
                    // cur.unshift({ name: 'USD', rate: '1', symbol: '$' });
                    vm.currencies = cur;
                }
            });
        }

        // vm.goToLink = goToLink;
        vm.pageId = '5b1a55be18cee21db7c29e3a';
        vm.localMenuState = localStorage.getItem('menuState') || {};
        if (Object.keys(vm.localMenuState).length !== 0) {
            vm.localMenuState = JSON.parse(vm.localMenuState);
        }
        $scope.gotoForgot = function () {
            jQuery('#ziyaratLoginModal').modal('hide');
            jQuery('body').removeClass('modal-open');
            jQuery('.modal-backdrop').remove();
            $state.go('forgotpassword')
        }
        // vm.pageId = 'donation-ways';
        function searchPage() {
            if (!vm.searchValue) {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: $translate.instant("Nothing to Search"),
                    showConfirmButton: false,
                    timer: 2000
                });
                return;
            }
            menuService.findPage(vm.searchValue).then(res => {
                if (res) {
                    if (res.data) {
                        // window.location.assign(`/#/${res.data.name}/${res.data.id}`)
                        window.location.assign(res.data);
                    }

                }
            }).catch(err => {
                swal({
                    position: 'center-center',
                    type: 'error',
                    title: err.data,
                    showConfirmButton: false,
                    timer: 2000
                })
            })

        }
        function setActiveLink(x) {
            return vm.localMenuState.isActive == x;
        }
        function saveActiveLink(x) {
            vm.localMenuState.isActive = x.menuName;
            localStorage.removeItem("menuState");
            localStorage.setItem("menuState", JSON.stringify(vm.localMenuState));
        }
        function setStateInLocalStorage(type, menu) {
            if (type === 'mainMenu') {
                vm.localMenuState.hideParent = true;
                vm.localMenuState.selectedMenu = menu;
                vm.localMenuState.childMenu = menu.subMenu;
            } else if (type === 'childMenu') {
                vm.localMenuState.hideParent = true;
                vm.localMenuState.hideChild = true;
                vm.localMenuState.selectedMenu = menu;
                vm.localMenuState.grandChildMenu = menu.subMenu;
            } else if (type === 'previousMenu') {
                if (vm.localMenuState.grandChildMenu && vm.localMenuState.grandChildMenu.length) {
                    vm.localMenuState.hideChild = false;
                    vm.localMenuState.grandChildMenu = {};
                } else {
                    vm.localMenuState.hideParent = false;
                    vm.localMenuState.selectedMenu = {};
                    vm.localMenuState.childMenu = {};
                }
            }
            localStorage.removeItem("menuState");
            localStorage.setItem("menuState", JSON.stringify(vm.localMenuState));
        }
        function mainMenuClick(menu) {
            setStateInLocalStorage('mainMenu', menu);
        }
        function goPreviousMenu() {
            setStateInLocalStorage('previousMenu');
        }
        function childMenuClick(menu) {
            setStateInLocalStorage('childMenu', menu);
        }
        //Save edit menu
        function SaveEdit() {
            let obj = new Object();
            obj.id = vm.menuIdEdit;
            obj.menuName = vm.menuNameEdit;
            obj.priority = vm.priorityEdit;
            obj.language = localStorage.getItem('lang');
            menuService.SaveEdit(obj).then(function (res) {
                if (res.status == 201) {
                    swal({
                        position: 'center-center',
                        type: 'success',
                        title: $translate.instant(res.data),
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
                else {
                    swal({
                        position: 'center-center',
                        type: 'error',
                        title: "menu is not Registered please Try Again",
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
                jQuery("#rootModal").modal("hide");
                getMenus();
                getSubMenus();
                getSubMunuList();
            });
        }
        async function changeLanguage(lang) {

            // update user profile language here if user is logged in 
            if ($rootScope.loggedInUserDetails && $rootScope.loggedInUserDetails.email != null) {
                let userObj = {
                    language: lang,
                    _id: $rootScope.loggedInUserDetails.id
                };
                let resp = await donarService.updateProfile(userObj);
                console.log(resp);
            }

            $translate.use(lang);
            localStorage.setItem('lang', lang);
            localStorage.removeItem('menuState');
            // if(vm.menuId)
            if ($state.current.name) {
                if ($state.current.name === 'home2') {
                    window.location = "#/home";
                    // $state.go('home');
                }
                location.reload();
            } else
                $state.go('home')
        }

        $rootScope.$on('$translateChangeSuccess', function (event, data) {
            $rootScope.userConfig.lang = data.language;
        });

        function changeCurrency(title, symbol, longName) {
            $rootScope.userConfig.currency = {
                'title': title,
                'symbol': symbol,
                'rateExchange': 1,
                'currencyName': longName
            };
            currencyService.getCurrencyByName(title)
                .then(function (response) {
                    if (response.data.length > 0) {
                        var rateExchange = response.data[0].rate;
                        sessionStorage.setItem('currency', JSON.stringify({
                            'title': title,
                            'symbol': symbol,
                            'rateExchange': rateExchange,
                            'currencyName': longName
                        }));
                        sessionStorage.setItem('rateExchange', rateExchange);
                        location.reload();

                    } else {
                        sessionStorage.setItem('currency', JSON.stringify({
                            'title': title,
                            'symbol': symbol,
                            'rateExchange': 1,
                            'currencyName': longName
                        }));
                        sessionStorage.setItem('rateExchange', 1);
                        location.reload();
                    }
                });
        }

        //bind menu item to edit
        function bindMenuModal(menuItem) {
            vm.menuIdEdit = menuItem._id;
            vm.menuNameEdit = menuItem.menuName;
            vm.priorityEdit = menuItem.priority;
            jQuery("#rootModal").modal("show");
        }
        vm.getPageIdByName = function () {
            var lang = localStorage.getItem('lang');
            menuService.getPageIdByName($translate.instant('DONATION WAYS'), lang).then((res) => {
                if (res) vm.pageId = res.data;
            })
        }
        //load main menu
        function LoadMainMenu() {
            menuService.LoadMainMenu().then(
                function (res) {
                    res.data.forEach(function (e) {

                        if (e.subMenu.length) {
                            e.subMenu.sort((a, b) => a.priority - b.priority);
                            e.subMenu = e.subMenu.map(se => {
                                if (se.subMenu.length) {
                                    se.subMenu.sort((a, b) => a.priority - b.priority)
                                }
                                return se;
                            })
                        }
                    });
                    vm.mainMenuList = res.data.sort((a, b) => a.priority - b.priority);
                    vm.getPageIdByName();
                }
            );
            getAllCurrency();


            setTimeout(function () {
                $scope.$apply(function () {
                    let exist = config.SecuredRoutes.includes($location.path());
                    if (exist && $rootScope.userId == undefined) {
                        jQuery('#globalLoginModalSecure').modal('show');
                    }
                });
            }, 1500);
          

        }

        //get sub menu list
        function getSubMunuList() {
            var rootMenuid = vm.selectedRootMenuLink._id;
            var lang = localStorage.getItem('lang');
            menuService.getMenuById(rootMenuid, lang).then(function (res) {
                // vm.subMenuList = res.data.subMenu;
                vm.subMenuList = res.data.subMenu.sort(function (a, b) {
                    return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);
                });
                vm.menuListByCategory = vm.menuList.slice();
                let newArr = [];
                for (let i = 0; i < vm.menuListByCategory.length; i++) {
                    const menu = vm.menuListByCategory[i];
                    if (menu.subMenuType && menu.subMenuType == vm.selectedRootMenuLink.menuName) {
                        newArr.push(menu);
                    }
                }
                if (newArr.length) {
                    vm.menuListByCategory = newArr.slice();
                } else {
                    vm.menuListByCategory = vm.menuList.filter(m => !m.subMenuType);
                }
            });
        }

        //get sub menu list
        function getSubMunuList2() {
            var rootMenuid = vm.selectedRootMenuLink2._id;
            var lang = localStorage.getItem('lang');

            menuService.getMenuById(rootMenuid, lang).then(function (res) {
                if (res.data && res.data.subMenu) {
                    vm.subMenuList2 = res.data.subMenu.sort(function (a, b) {
                        return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);
                    });
                }
            });
        }

        //This function adds new menu
        function fillMenuList() {
            var lang = localStorage.getItem('lang');
            vm.menuList = [];
            vm.mainMenuList = [];
            //home page
            let obj = new Object();
            obj.menuName = "Home";
            obj.menuLink = "/#/home";
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            ////projects
            obj = new Object();
            obj.menuName = "Projects";
            obj.menuLink = "/#/projects";
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            ////projects
            obj = new Object();
            obj.menuName = "General Care";
            obj.menuLink = "/#/generalcares";
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            obj = new Object();
            obj.menuName = "Daral Zehra";
            obj.menuLink = "/#/daralzahra"
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            ////religiouspayments
            obj = new Object();
            obj.menuName = "Religious payment";
            obj.menuLink = "/#/religiouspayments";
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            ////religiouspayments
            obj = new Object();
            obj.menuName = "Sadaqa";
            obj.menuLink = "/#/sadaqas";
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            obj = new Object();
            // obj.menuName = "Blog";
            // obj.menuLink = "/#/posts";
            // vm.menuList.push(obj);
            obj = new Object();
            obj.menuName = "General Care";
            obj.menuLink = "/#/generalcares";
            // vm.menuList.push(obj);
            vm.mainMenuList.push(obj);
            obj = new Object();
            obj.menuName = "Daral Zehra";
            obj.menuLink = "/#/daralzahra";
            vm.mainMenuList.push(obj);
            // vm.menuList.push(obj);
            pageService.getPages().then(function (res) {
                let pages = res.data;
                pages.forEach(function (e) {
                    let obj = new Object();
                    obj.menuName = e.pageName;
                    if (e.pageName.toUpperCase() === 'GALLERY') {
                        obj.menuLink = '/#/gallery';
                    } else if (e.pageName.toUpperCase() === 'VOLUNTEER') {
                        obj.menuLink = '/#/volunteer';
                    } else {
                        obj.menuLink = '/#/page/' + e.pageName;
                    }
                    vm.menuList.push(obj);
                    vm.menuList = vm.menuList.filter(obj => obj.hasOwnProperty("menuLink") && obj['menuLink']);
                    let menu = {};
                    vm.menuList.map((item) => menu[item.menuName] = item)
                    vm.menuList = Object.values(menu);
                    vm.menuList = vm.menuList.sort((a, b) => a - b);
                    vm.mainMenuList.map((item) => menu[item.menuName] = item)
                    vm.mainMenuList = Object.values(menu)
                });
                return res;
            });
            programService.getProgramsByLang().then(function (res) {
                let programs = res.data;
                programs.forEach(function (e, index) {
                    let obj = new Object();
                    obj.menuName = e.programName;
                    if (e.hasOwnProperty('programType') && e.programType && e.programType.length && e.programType[0].programTypeName && (e.programType[0].programTypeName == "Projects" || e.programType[0].programTypeName == "Projets" || e.programType[0].programTypeName == "مشروع")) {
                        obj.menuLink = '/#/projectdetails/' + e.slug;
                        obj.subMenuType = $translate.instant('PROJECTS');
                    }
                    else if (e.hasOwnProperty('programType') && e.programType && e.programType.length && e.programType[0].programTypeName && (e.programType[0].programTypeName == "Sadaqa" || e.programType[0].programTypeName == "Sadaqah" || e.programType[0].programTypeName == "الصدقة" || e.programType[0].programTypeName == "صدقة")) {
                        obj.menuLink = '/#/sadaqadetails/' + e.slug;
                        obj.subMenuType = $translate.instant('SADAQAH');

                    }
                    else if (e.hasOwnProperty('programType') && e.programType && e.programType.length && e.programType[0].programTypeName && (e.programType[0].programTypeName == "General Care" || e.programType[0].programTypeName == "Soins généraux" ||
                        e.programType[0].programTypeName == "Premières nécessités" || e.programType[0].programTypeName == "الرعاية العامة")) {
                        if (e.programName === 'Premières nécessités' || e.programName === 'General Care' || e.programName === 'الرعاية العامة') {
                            obj.menuLink = '/#/generalcares';
                        } else {
                            obj.menuLink = '/#/generalcaredetails/' + e.slug;
                        }
                        obj.subMenuType = $translate.instant('ORPHANS');

                    }
                    else if (e.hasOwnProperty('programType') && e.programType && e.programType.length && e.programType[0].programTypeName && (e.programType[0].programTypeName == "Dar Al Zahra" || e.programType[0].programTypeName == "Dar-Al-Zahra" || e.programType[0].programTypeName == "(دار الزهراء (ع")) {
                        if (e.programName === 'Dar Al Zahra' || e.programName === 'دار الزهراء عليها السلام') {
                            obj.menuLink = '/#/daralzahra';
                        }
                        obj.menuLink = '/#/daralzahradetails/' + e.slug;
                        obj.subMenuType = $translate.instant('ORPHANS');

                    }
                    else if (e.hasOwnProperty('programType') && e.programType && e.programType.length && e.programType[0].programTypeName && (e.programType[0].programTypeName == "Religious Payments" || e.programType[0].programTypeName == "Paiements religieux" || e.programType[0].programTypeName == "الدفع الإسلامي" || e.programType[0].programTypeName == "المدفوعات الدينية")) {
                        obj.menuLink = '/#/religiouspayment_subcategories/' + e.slug;
                        obj.subMenuType = $translate.instant('ISLAMIC PAYMENTS');

                        if (e.programSubCategory.length > 0) {
                            _.forEach(e.programSubCategory, function (item) {
                                let subCat = new Object();
                                subCat.menuName = item.programSubCategoryName;
                                subCat.subMenuType = $translate.instant('ISLAMIC PAYMENTS');
                                subCat.menuLink = '/#/subcategorydetail/' + item.slug + '?programid=' + e.slug;
                                vm.menuList.push(subCat);
                            })
                        }
                    }
                    vm.menuList.push(obj);
                    vm.menuList = vm.menuList.filter(obj => obj.hasOwnProperty("menuLink") && obj['menuLink']);
                    let menu = {};
                    vm.menuList.map((item) => menu[item.menuName] = item)
                    vm.menuList = Object.values(menu);
                    vm.menuList = vm.menuList.sort((a, b) => a - b);

                    vm.menuListByCategory = vm.menuList.slice();
                });
                return res;
            });
            dynamicPageContentService.getAllPagesList(lang).then(function (response) {
                if (response.data) {
                    let pagesList = _.sortBy(response.data, ['parentPageName', 'subParentPageId']) || [];
                    pagesList.forEach(function (e) {
                        let obj = new Object();
                        obj.menuName = e.title;
                        if (e.title === $translate.instant('GALLERY PAGE')) {
                            obj.menuLink = '/#/gallery';
                        } else {
                            obj.menuLink = '/#/pages/' + e.slug;
                        }
                        vm.menuList.push(obj);
                        vm.menuList.filter(obj => obj.hasOwnProperty("menuLink") && obj['menuLink']);
                        let menu = {};
                        vm.menuList.map((item) => menu[item.menuName] = item)
                        vm.menuList = Object.values(menu)
                        vm.menuList = vm.menuList.sort((a, b) => a - b);

                    });
                }
            });
            pageContentService.getAllPageContent(lang).then(function (res) {
                if (res.data) {
                    let pagesList = _.sortBy(res.data, ['parentPageName', 'subParentPageId']) || [];
                    pagesList.forEach(function (e) {
                        let obj = new Object();
                        obj.menuName = e.pageName;
                        obj.menuLink = `/#/${e.slug}`
                        vm.menuList.push(obj);
                        vm.menuList = vm.menuList.filter(obj => obj.hasOwnProperty("menuLink") && obj['menuLink']);
                        let menu = {};
                        vm.menuList.map((item) => menu[item.menuName] = item)
                        vm.menuList = Object.values(menu);
                        vm.menuList = vm.menuList.sort((a, b) => a - b);

                        vm.menuListByCategory = vm.menuList.slice();
                    });
                }
            })

        }

        function addRootMenu() {
            menuService.addRootMenu(getmenuobject()).then(function (res) {
                if (res.status == 200) {
                    swal({
                        title: 'Site Link Added successfully',
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false,
                    }).then(function () {
                        location.reload();
                    });
                }
                else {
                    swal({
                        position: 'center-center',
                        type: 'error',
                        title: "menu is not Registered please Try Again",
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
                getMenus();
                getSubMenus();
                return res;
            });
        }

        //Empty node
        function addRootNode() {
            let obj = new Object();
            obj.menuName = vm.menuName;
            obj.menuLink = "#";
            obj.priority = vm.priority;
            obj.language = localStorage.getItem('lang');
            menuService.addRootMenu(obj).then(function (res) {
                if (res.status == 200) {
                    swal({
                        title: 'Node Added successfully',
                        position: 'center-center',
                        type: 'success',
                        allowOutsideClick: false,
                    }).then(function () {
                        location.reload();
                    });
                }
                else {
                    swal({
                        position: 'center-center',
                        type: 'error',
                        title: "menu is not Registered please Try Again",
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
                getMenus();
                getSubMenus();
                return res;
            });
        }

        function addSubMenu(menuhirerchy) {
            menuService.addSubMenu(getUpdatedmenuobject(menuhirerchy)).then(function (res) {
                swal({
                    title: 'Sub Menu Added successfully',
                    position: 'center-center',
                    type: 'success',
                    allowOutsideClick: false,
                }).then(function () {
                    location.reload();
                });
            });
        }

        //create menu object
        function getmenuobject() {
            var obj = {};
            obj.menuName = vm.selectedSiteLink.menuName;
            obj.menuLink = vm.selectedSiteLink.menuLink;
            obj.language = localStorage.getItem('lang');
            obj.priority = vm.rootPriority;
            return obj;
        }

        function getUpdatedmenuobject(getUpdatedmenuobject) {
            var obj = {};

            if (getUpdatedmenuobject == 'child') {
                obj.rootMenu = vm.selectedRootMenuLink;
                obj.subMenu = vm.selectedSubMenuLink;
                obj.subMenu.priority = vm.subPriority;
                obj.language = localStorage.getItem('lang');
            } else {
                obj.rootMenu = vm.selectedRootMenuLink2;
                obj.subMenu = vm.selectedSubMenuLink2;
                obj.subMenu.priority = vm.subPriority2;
                obj.language = localStorage.getItem('lang');
            }

            return obj;
        }

        // gets all menus
        function getMenus() {
            menuService.getMenus().then(function (res) {
                vm.rootMenuList = res.data.sort(function (a, b) {
                    return (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0);
                });
                return res;

            });
        }

        // gets all sub menus
        function getSubMenus() {
            menuService.getSubMenus().then(function (res) {
                if (res.data && res.data.length) {
                    vm.subMenusList = res.data;
                }
            });
        }

        //get menu data for update
        function getmenuForUpdate() {
            var id = $location.search().menuid;
            var lang = localStorage.getItem('lang');

            menuService.getmenuById(id, lang).then(function (res) {
                vm.menus = res.data;
                vm.menuId = res.data._id;
                vm.menuTitle = res.data.menuName;

                jQuery('#edit .froala-view').html(res.data.menuContent);

                return res;

            });
        }

        // Delete menu by Id
        function deleteMenu(menuId) {
            swal({
                title: $translate.instant('Are you sure?'),
                text: $translate.instant("You won't be able to revert this!"),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: $translate.instant('Yes, delete it!'),
                cancelButtonText: $translate.instant('No, cancel!'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    menuService.deleteMenu(menuId).then(function (res) {
                        vm.result = res.data;

                        swal(
                            'Deleted!',
                            'menu has been deleted.',
                            'success'
                        )
                        getSubMunuList();
                        return res;

                    });
                } else if (result.dismiss === 'cancel') {
                    swal(
                        'Cancelled',
                        '',
                        'error'
                    )
                }
            });
        }

        function deleteMenuLevel2(menuId) {
            swal({
                title: $translate.instant('Are you sure?'),
                text: $translate.instant("You won't be able to revert this!"),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: $translate.instant('Yes, delete it!'),
                cancelButtonText: $translate.instant('No, cancel!'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    menuService.deleteMenu(menuId).then(function (res) {
                        vm.result = res.data;

                        swal(
                            'Deleted!',
                            'menu has been deleted.',
                            'success'
                        )
                        getSubMunuList2();
                        return res;

                    });
                } else if (result.dismiss === 'cancel') {
                    swal(
                        'Cancelled',
                        '',
                        'error'
                    )
                }
            });
        }

        $scope.checkForDpMenu = function (menuName) {
            if (menuName.toLowerCase() == $translate.instant("BASIC CARE").toLowerCase() || menuName.toLowerCase() == $translate.instant("DAR AL ZAHRA").toLowerCase()) {
                return false
            } else {
                return true
            }
        }
        // delete root menu
        // Delete menu by Id
        function deleteRootMenu(menuId) {
            swal({
                title: $translate.instant('Are you sure?'),
                text: $translate.instant("You won't be able to revert this!"),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: $translate.instant('Yes, delete it!'),
                cancelButtonText: $translate.instant('No, cancel!'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    menuService.deleteRootMenu(menuId).then(function (res) {
                        vm.result = res.data;

                        swal(
                            'Deleted!',
                            'menu has been deleted.',
                            'success'
                        )
                        getMenus();
                        getSubMenus();
                        getSubMunuList();

                        return res;

                    });

                    // result.dismiss can be 'cancel', 'overlay',
                    // 'close', and 'timer'
                } else if (result.dismiss === 'cancel') {
                    swal(
                        'Cancelled',
                        '',
                        'error'
                    )
                }
            });

        }

        //Browser notification block and unBlock
        function bellNotification() {
            jQuery('#bellNotificationBtn').addClass('noAction');
            setTimeout(function () {
                jQuery('#bellNotificationBtn').removeClass('noAction');
            }, 1000);

            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
            }
            // Let's check if the user is okay to get some notification
            else if (Notification.permission === "granted") {
                // If it's okay let's create a notification
                //var notification = new Notification("Notification is Active!");
                var note = new Noty({
                    text: 'Notification is Active!'
                })
                note.setTimeout(500);
                note.show();
            }
            // Otherwise, we need to ask the user for permission
            // Note, Chrome does not implement the permission static property
            // So we have to check for NOT 'denied' instead of 'default'
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    /*  alert('UnBlock Browser Notifications');*/
                    // Whatever the user answers, we make sure we store the information
                    if (!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                    // If the user is okay, let's create a notification
                    if (permission === "granted") {
                        var note = new Noty({
                            text: 'Notification is Active!'
                        })
                        note.setTimeout(500);
                        note.show();
                    }
                });
            }
            else if (Notification.permission === 'denied') {
                alert('UnBlock Browser Notifications');
            }

        }

        function getAllDynamicPagesList() {
            var lang = localStorage.getItem('lang');
            dynamicPageContentService.getAllPagesList(lang).then(function (response) {
                if (response.data) {
                    vm.allPagesList = _.sortBy(response.data, ['parentPageName', 'subParentPageId']) || [];
                }
            });
        }
    }
})()