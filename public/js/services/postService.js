(function () {

    angular.module('mainApp').factory('postService', postService);
    function postService($http) {
        return {
            publishPost: publishPost,
            updatePost: updatePost,
            getPosts: getPosts,
            deletePost: deletePost,
            getPostById: getPostById,
            getRelatedPosts: getRelatedPosts
        }
        //pulish new post
        function publishPost(content) {

            return $http({
                method: 'post',
                url: '/api/post/add',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function getRelatedPosts(content) {
            return $http({
                method: 'post',
                url: '/api/post/related/list/',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function updatePost(content) {

            return $http({
                method: 'put',
                url: '/api/post/update/',
                data: content,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function getPosts() {
            return $http({
                method: 'get',
                url: '/api/post/list',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function getPostById(postId) {
            return $http({
                method: 'get',
                url: '/api/post/' + postId,
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function deletePost(postId) {
            return $http({
                method: 'delete',
                url: '/api/post/delete/' + postId + '',

                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
    }
})()