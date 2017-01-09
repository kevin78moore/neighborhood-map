var model = [
  {
    name: "Simi Valley Town Center",
		lat: 34.283965,
		lng: -118.770246,
		show: true,
		selected: false,
		venueid: "5257ea5111d20d6aea85a5b6"
  },
  {
    name: "Regal Movie Theater",
		lat: 34.284527,
		lng: -118.719896,
		show: true,
		selected: false,
		venueid: "52416c498bbd7a57df948f60"
  },
  {
    name: "Cultural Arts Center",
		lat: 34.271224,
		lng: -118.735673,
		show: true,
		selected: false,
		venueid: "4b67c5a6f964a5204f5d2be3"
  },
  {
    name: "Atherwood Park",
		lat: 34.287141,
		lng: -118.752690,
		show: true,
		selected: false,
		venueid: "4b7e34f0f964a52010e62fe3"
  },
  {
    name: "Walmart",
		lat: 34.279722,
		lng: -118.741287,
		show: true,
		selected: false,
		venueid: "4c14d78ba9c220a15e1c589d"
  },
  {
    name: "Harley's Bowling Alley",
		lat: 34.280074,
		lng: -118.689855,
		show: true,
		selected: false,
		venueid: "4d3102ed2c76a143e5bb60c7"
  },
  {
    name: "In-N-Out Burger",
		lat: 34.283061,
		lng: -118.690836,
		show: true,
		selected: false,
		venueid: "4b643ef6f964a52037a62ae3"
  },
  {
    name: "Chase Bank",
		lat: 34.272048,
		lng: -118.693240,
		show: true,
		selected: false,
		venueid: "4bb353bc2397b713e6f037b3"
  },
  {
    name: "Simi Hills Golf Course",
		lat: 34.289667,
		lng: -118.695895,
		show: true,
		selected: false,
		venueid: "53f32fcd498e571e10cfd231"
  },
  {
    name: "Public Library",
		lat: 34.288929,
		lng: -118.719352,
		show: true,
		selected: false,
		venueid: "4c8a297c1797236acbe85e88"
  }
];

/* View Model */

var viewModel = function() {

  var self = this;

  self.errorDisplay = ko.observable('');

  // populate mapList with each Model
  self.mapList = [];
  model.forEach(function(marker){
    self.mapList.push(new google.maps.Marker({
      position: {lat: marker.lat, lng: marker.lng},
      map: map,
      name: marker.name,
      show: ko.observable(marker.show),  // sets observable for checking
      selected: ko.observable(marker.selected),
      venueid: marker.venueid,   // foursquare venue id
      animation: google.maps.Animation.DROP
    }));
  });

  //store mapList length
  self.mapListLength = self.mapList.length;

  //set current map item
  self.currentMapItem = self.mapList[0];

  // function to make marker bounce but stop after 700ms
  self.makeBounce = function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null);}, 700);
  };

  // function to add API information to each marker
  self.addApiInfo = function(passedMapMarker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + passedMapMarker.venueid + '?client_id=CGOJQ1C3N5GARA4Q53TWRBUWARWXRPEXEG1KM1CCVFDWO2VA&client_secret=OQXLE0UEJOKJLGOM0AT5NA5JE10AXSFNS3GT1PKJGCQ3JJM2&v=20160614',
        dataType: "json",
        success: function(data){
          // stores results to display likes and ratings
          var result = data.response.venue;

          // add likes and ratings to marker
          passedMapMarker.likes = result.hasOwnProperty('likes') ? result.likes.summary: "";
          passedMapMarker.rating = result.hasOwnProperty('rating') ? result.rating: "";
        },
        //alert if there is error in recievng json
        error: function(e) {
          self.errorDisplay("Foursquare data is unavailable. Please try again later.");
        }
      });
  };

  // iterate through mapList and add marker event listener and API information
  for (var i=0; i < self.mapListLength; i++){
    (function(passedMapMarker){
			//add API items to each mapMarker
			self.addApiInfo(passedMapMarker);
			//add the click event listener to mapMarker
			passedMapMarker.addListener('click', function(){
				//set this mapMarker to the "selected" state
				self.setSelected(passedMapMarker);
			});
		})(self.mapList[i]);
  }

  // create a filter observable for filter text
  self.filterText = ko.observable('');


  // calls every keydown from input box
  self.applyFilter = function() {

    var currentFilter = self.filterText();
    infowindow.close();

    //filter the list as user seach
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.mapListLength; i++) {
				if (self.mapList[i].name.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
					self.mapList[i].show(true);
					self.mapList[i].setVisible(true);
				} else {
					self.mapList[i].show(false);
					self.mapList[i].setVisible(false);
				}
			}
    }
    infowindow.close();
  };

  // to make all marker visible
  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.mapListLength; i++) {
      self.mapList[i].show(showVar);
      self.mapList[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
		for (var i = 0; i < self.mapListLength; i++) {
			self.mapList[i].selected(false);
		}
	};

  self.setSelected = function(location) {
		self.setAllUnselected();
        location.selected(true);

        self.currentMapItem = location;

        formattedLikes = function() {
        	if (self.currentMapItem.likes === "" || self.currentMapItem.likes === undefined) {
        		return "No likes to display";
        	} else {
        		return "Location has " + self.currentMapItem.likes;
        	}
        };

        formattedRating = function() {
        	if (self.currentMapItem.rating === "" || self.currentMapItem.rating === undefined) {
        		return "No rating to display";
        	} else {
        		return "Location is rated " + self.currentMapItem.rating;
        	}
        };

        var formattedInfoWindow = "<h5>" + self.currentMapItem.name + "</h5>" + "<div>" + formattedLikes() + "</div>" + "<div>" + formattedRating() + "</div>";

		infowindow.setContent(formattedInfoWindow);

        infowindow.open(map, location);
        self.makeBounce(location);
	};
};
