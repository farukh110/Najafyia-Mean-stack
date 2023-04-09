(function () {

  angular.module('mainApp').controller('postController', postController);

  function postController($scope, $location, postService, multipartForm) {

    var vm = this;
    var postData = [];
    vm.result = "";
    vm.postId = "";
    vm.publishPost = publishPost;
    vm.updatePost = updatePost;
    vm.getPosts = getPosts;
    vm.deletePost = deletePost;
    vm.getPostForUpdate = getPostForUpdate;
    vm.getPostDetail = getPostDetail;
    vm.getActivePosts = getActivePosts;
    vm.uploadImageValidator = uploadImageValidator;
    vm.validImage = true;
    vm.posts = [];
    vm.file = {};

    jQuery(document).ready(function () {
      jQuery('input[type="file"]').change(function () {
        var fileExtension = this.value.split('.').pop();
        vm.uploadImageValidator(fileExtension);
      });
    });
    function publishPost() {
      if (vm.file.name != undefined) {
        multipartForm.post('/upload', vm.file).then(function (res) {
          var imageLink = res.data.name;
          let obj = getPostobject();
          obj.imageLink = imageLink;
          postService.publishPost(obj).then(function (res) {

            swal({
              title: $translate.instant(res.data),
              position: 'center-center',
              type: 'success',
              allowOutsideClick: false,
            }).then(function () {
              window.location = "#/admin/postlist";
            });
            return res;
          });
        });
      }
      else {
        let obj = getPostobject();
        obj.imageLink = "defaultpost.jpg";
        postService.publishPost(getPostobject()).then(function (res) {
          swal({
            title: $translate.instant(res.data),
            position: 'center-center',
            type: 'success',
            allowOutsideClick: false,
          }).then(function () {
            window.location = "#/admin/postlist";
          });
          return res;
        });
      }
    }
    function updatePost() {
      if (vm.file.name != undefined) {
        multipartForm.post('/upload', vm.file).then(function (res) {
          let obj = getUpdatedPostobject();
          obj.imageLink = res.data.name;
          postService.updatePost(obj).then(function (res) {

            swal({
              title: $translate.instant(res.data),
              position: 'center-center',
              type: 'success',
              allowOutsideClick: false,
            }).then(function () {
              window.location = "#/admin/postlist";
            });
            return res;
          });
        });
      }
      else {
        let obj = getUpdatedPostobject();
        obj.imageLink = vm.imageLink;
        postService.updatePost(obj).then(function (res) {

          swal({
            title: $translate.instant(res.data),
            position: 'center-center',
            type: 'success',
            allowOutsideClick: false,
          }).then(function () {
            window.location = "#/admin/postlist";
          });
          return res;
        });
      }

    }
    function getActivePosts() {

      postService.getPosts().then(function (res) {
        vm.Posts = _.filter(res.data, function (e) {
          return e.isActive == true;
        });
        // .sort((a,b)=>{
        //   return a.created==b.created;
        // });
        return res;
      });
    }
    //get project Detail by id
    function getPostDetail() {
      var url = $location.url();
      var arr = url.split("/");
      var id = arr[arr.length - 1];
      postService.getPostById(id).then(function (res) {
        vm.PostDetail = res.data;
        getRelatedPosts(vm.PostDetail._id);
        jQuery("#postContent").html(vm.PostDetail.postContent);

      });
    }
    // get Related posts
    function getRelatedPosts(id) {
      var obj = new Object();
      obj.id = id;
      postService.getRelatedPosts(obj).then(function (res) {
        let numberOfPost = 3;
        let count = 0;
        var val = 0;
        let activePosts = [];
        res.data.forEach(function (e) {
          if (e.isActive == true) {
            activePosts.push(e);
          }
        });
        vm.relatedPosts = [];
        while ((count < numberOfPost) && (count < activePosts.length)) {
          val = Math.floor(Math.random() * (activePosts.length));
          vm.relatedPosts.push(activePosts[val]);
          count++;
        }

      });
    }
    function getPostobject() {
      var obj = {};
      obj.title = vm.postTitle;
      obj.description = vm.description;
      obj.content = jQuery('#edit .froala-view').html();
      return obj;
    }
    function getUpdatedPostobject() {
      var obj = {};
      obj.title = vm.postTitle;
      obj.description = vm.description;
      obj.content = jQuery('#edit .froala-view').html();
      obj.id = vm.postId;

      return obj;
    }
    //get all posts
    function getPosts() {

      postService.getPosts().then(function (res) {
        vm.posts = res.data;
        return res;

      });
    }
    //get post by id for update post
    function getPostForUpdate() {
      var id = $location.search().postid;

      postService.getPostById(id).then(function (res) {
        vm.posts = res.data;
        vm.postId = res.data._id;
        vm.postTitle = res.data.postName;
        vm.description = res.data.description;
        vm.imageLink = res.data.imageLink;
        jQuery('#edit .froala-view').html(res.data.postContent);

        return res;

      });
    }
    //Delete post
    function deletePost(postId) {
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
          postService.deletePost(postId).then(function (res) {
            vm.result = res.data;
            swal(
              'Deleted!',
              'Post has been deleted.',
              'success'
            )
            getPosts();
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
    //Image Validator
    function uploadImageValidator(UploadedFile) {
      var ext = UploadedFile;
      if (angular.lowercase(ext) === 'jpg' || angular.lowercase(ext) === 'jpeg' || angular.lowercase(ext) === 'png') {
        //alert("Valid File Format");
      }
      else {
        swal(
          'Please Choose jpg, jpeg or png image file',
          '',
          'error'
        );
        vm.file = null;
        jQuery('input[type="file"]').val('');
      }
    }

  }
})()