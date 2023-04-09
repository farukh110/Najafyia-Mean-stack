(function () {
  angular.module("mainApp").factory("menuService", menuService);

  function menuService($http) {
    var vm = this;
    vm.menuState = {};
    return {
      addRootMenu: addRootMenu,
      addSubMenu: addSubMenu,
      getMenus: getMenus,
      getSubMenus: getSubMenus,
      getMenuById: getMenuById,
      deleteMenu: deleteMenu,
      deleteRootMenu: deleteRootMenu,
      getRelatedmenus: getRelatedmenus,
      LoadMainMenu: LoadMainMenu,
      SaveEdit: SaveEdit,
      getPageIdByName: getPageIdByName,
      findPage: findPage
    };

    //save on edit
    function SaveEdit(content) {
      return $http({
        method: "put",
        url: "/api/menu/edit",
        data: content,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    //load main menu
    function getPageIdByName(name, lang) {
      return $http({
        method: "get",
        url: `/api/getPageIdByName/${name}/${lang}`,
        params: { name, lang },
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }
    //load main menu
    function LoadMainMenu() {
      var userLang = localStorage.getItem("lang");
      return $http({
        method: "get",
        url: "/api/menu/root/list/" + userLang,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }
    //find page
    function findPage(search) {
      var lang = localStorage.getItem("lang");
      return $http({
        method: "get",
        url: "/api/searchPage/",
        params: { search, lang },
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    //pulish new menu
    function addRootMenu(content) {
      return $http({
        method: "post",
        url: "/api/menu/add",
        data: content,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function getRelatedmenus(content) {
      return $http({
        method: "post",
        url: "/api/menu/related/list/",
        data: content,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function addSubMenu(content) {
      return $http({
        method: "put",
        url: "/api/menu/submenu/add",
        data: content,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function getMenus() {
      var userLang = localStorage.getItem("lang");
      return $http({
        method: "get",
        url: "/api/menu/list/" + userLang,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function getSubMenus() {
      var userLang = localStorage.getItem("lang");
      return $http({
        method: "get",
        url: "/api/menu/subMenuList/" + userLang,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function getMenuById(menuId, lang) {
      return $http({
        method: "get",
        url: `/api/menu/${menuId}/${lang}`,
        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function deleteMenu(menuId) {
      return $http({
        method: "delete",
        url: "/api/menu/delete/" + menuId + "",

        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }

    function deleteRootMenu(menuId) {
      return $http({
        method: "delete",
        url: "/api/menu/delete/root/" + menuId + "",

        headers: { "Content-Type": "application/json" },
        success: function (response) {
          return response.data;
        },
        error: function (error) {
          return error;
        }
      });
    }
  }
})();
