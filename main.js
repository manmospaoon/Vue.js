/* jshint curly:true, debug:true */
/* globals $, Vue */

// Flickr API key
var apiKey = "ここにAPIキーを入れてください";

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
    photos: []
  },
  methods: {
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

      $.getJSON(flickr_url, function(data) {
        if (data.stat === "ok") {
          vm.photos = data.photos.photo.map(function(photo) {
            return {
              id: photo.id,
              imageURL: vm.getFlickrImageURL(photo, "q"),
              pageURL: vm.getFlickrPageURL(photo),
              text: vm.getFlickrText(photo)
            };
          });
        }
      });
    }
  }
});