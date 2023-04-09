(function () {
    angular.module("mainApp").factory("MetaTagsService", MetaTagsService);
    function MetaTagsService() {
        var vm = this;
        vm.setDefaultTags = setDefaultTags;
        vm.setTags = setTags;
        var defaultTags = {};
        var tagElements = [];
        vm.SERVER_URL = 'https://najafyia.org';
        return {
            setDefaultTags: setDefaultTags,
            setTags: setTags,
            mergeDefaultTags: mergeDefaultTags,
            clearTags: clearTags,
            setPageMeta: setPageMeta,
            SERVER_URL: vm.SERVER_URL
        }
        function setDefaultTags(tags) {
            angular.copy(tags, defaultTags);
            setTags({});
        }
        function setTags(tags) {
            clearTags();
            mergeDefaultTags(tags);
            angular.forEach(tags, function (content, name) {
                var tagElement = getTagElement(content, name);
                document.head.appendChild(tagElement);
                tagElements.push(tagElement);
            });
        }
        function mergeDefaultTags(tags) {
            angular.forEach(defaultTags, function (defaultTagContent, defaultTagName) {
                if (!tags[defaultTagName]) {
                    tags[defaultTagName] = defaultTagContent;
                } else if (defaultTagName === 'title') {
                    tags['title'] += ' - ' + defaultTagContent;
                }
            });
            return tags;
        }
        function getTagElement(content, name) {
            if (name == 'title') {
                // Special provision for the title element
                var title = document.createElement('title');
                title.textContent = content;
                return title;
            } else {
                // Opengraph uses [property], but everything else uses [name]
                var nameAttr = (name.indexOf('og:') === 0) ? 'property' : 'name';
                var meta = document.createElement('meta');
                meta.setAttribute(nameAttr, name);
                meta.setAttribute('content', content);
                return meta;
            }
        }
        function clearTags() {
            angular.forEach(tagElements, function (tagElement) {
                document.head.removeChild(tagElement);
            });
            tagElements.length = 0;
        }
        function setPageMeta(metaData, pageId, pageName) {
            if(!metaData) return;
            let div = document.createElement("div");
            div.innerHTML =  metaData.description;
            metaData.description = div.innerHTML.replace( /(<([^>]+)>)/ig, '');
            metaData.description = metaData.description.trim().substring(0,279-metaData.url.length);
            SocialShareKit.init({
                selector: '.ssk',
                image: metaData.image,
                url: metaData.url,
                text:  div.innerHTML,
                title: metaData.title
            });
            setTags({
                'title': metaData.title,
                // OpenGraph
                'og:type': 'page',
                'og:title': metaData.title,
                'og:description':  metaData.description,
                'og:image': metaData.image,
                'og:image:width': '680',
                'og:image:height': '340',
                'og:url': `${vm.SERVER_URL}/#/${pageName}/${pageId}`,
                // Twitter
                'twitter:card': 'summary_large_image',
                'twitter:site': '@najafyia',
                'twitter:creator': '@binaryvibes',
                'twitter:title': metaData.title,
                'twitter:description':  metaData.description,
                'twitter:image': metaData.image,
              });
        }
    }
})();
