/* jshint curly:true, debug:true */
/* globals $, Vue */

// Flickr API key
var apiKey = "ここにAPIキーを入れてください";

var IS_INITIALIZED = "IS_INITIALIZED";
var IS_FETCHING = "IS_FETCHING";
var IS_FAILED = "IS_FAILED";
var IS_FOUND = "IS_FOUND";
var IS_NOT_FOUND = "IS_NOT_FOUND";

Vue.directive("tooltip", {
  bind: function(el, binding) {
    $(el).tooltip({
      title: binding.value,
      placement: "bottom"
    });
  },
  unbind: function(el) {
    $(el).tooltip("destroy");
  }
});

new Vue({
  el: "#app",
  data: {
    photos: [],
    currentState: IS_INITIALIZED
  },
  computed: {
    isInitalized: function() {
      return this.currentState === IS_INITIALIZED;
    },
    isFetching: function() {
      return this.currentState === IS_FETCHING;
    },
    isFailed: function() {
      return this.currentState === IS_FAILED;
    },
    isFound: function() {
      return this.currentState === IS_FOUND;
    },
    isNotfound: function() {
      return this.currentState === IS_NOT_FOUND;
    }
  },  
  methods: {
    toFetching: function() {
      this.currentState = IS_FETCHING;
    },
    toFailed: function() {
      this.currentState = IS_FAILED;
    },
    toFound: function() {
      this.currentState = IS_FOUND;
    },
    toNotfound: function(){
      this.currentState = IS_NOT_FOUND;
    },
    getFlickrImageURL: function(photo, size) {
      var url =
        "https://farm" +
        photo.farm +
        ".staticflickr.com/" +
        photo.server +
        "/" +
        photo.id +
        "_" +
        photo.secret;
      if (size) {
        url += "_" + size;
      }
      url += ".jpg";
      return url;
    },
    getFlickrPageURL: function(photo) {
      return "https://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
    },
    getFlickrText: function(photo) {
      var text = "\"" + photo.title + "\" by " + photo.ownername;
      if (photo.license == "4") {
        // Creative Commons Attribution（CC BY）ライセンス
        text += " / CC BY";
      }
      return text;
    },
    fetchImagesFromFlickr: function(event) {
      var vm = this;
      var searchText = event.target.elements.search.value;
      var parameters = $.param({
        method: "flickr.photos.search",
        api_key: apiKey,
        text: searchText,
        sort: "interestingness-desc",
        per_page: 12,
        license: "4",
        extras: "owner_name,license",
        format: "json",
        nojsoncallback: 1 
      });
      var flickr_url = "https://api.flickr.com/services/rest/?" + parameters;
      
      if (this.isFetching && searchText === vm.prevSearchText) {
        return;
      }

      vm.prevSearchText = searchText;

      this.toFetching();
      $.getJSON(flickr_url, function(data) {
        if (data.stat !== "ok") {
          vm.toFailed();
          return;
        }

        var _photos = data.photos.photo;

        if (_photos.length === 0) {
          vm.toNotfound();
          return;
        }

        vm.photos = _photos.map(function(photo) {
          return {
            id: photo.id,
            imageURL: vm.getFlickrImageURL(photo, "q"),
            pageURL: vm.getFlickrPageURL(photo),
            text: vm.getFlickrText(photo)
          };
        });
        vm.toFound();
      }).fail(function() {
        vm.toFailed();
      });
    }
  }
});