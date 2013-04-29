'use strict';



function SearchCtrl($scope, $http) {


// ----- Begin Youtube Player Functionality Definition ------
	var container = 'youtubePlayer';

	var player; // is a reference to the youtube player on the screen that gets assigned after onPlayerReady
	var MyYoutubeObject = {
    load: function(container, videoId) {
      if (typeof(YT) === 'undefined' || typeof(YT.Player) === 'undefined') {
        window.onYouTubeIframeAPIReady = function() {
          MyYoutubeObject._create(container, videoId);
        };

        $.getScript('//www.youtube.com/iframe_api');
      } else {
        MyYoutubeObject._create(container, videoId);
      }
    },

    _create: function(container, videoId) {
      new YT.Player(container, {
        videoId: videoId,
        //width: 356,
        //height: 200,
        events: {
		      'onReady': MyYoutubeObject.onPlayerReady,
		      'onStateChange': MyYoutubeObject.onPlayerStateChange
		    },
        playerVars: {
          //autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showInfo: 0,
          showSearch: 0,
          egm: 0,
          border: 0
        }
      });
    },

    onPlayerReady: function(e) {
    	player = e.target;
    	player.playVideo();
    },
    onPlayerStateChange: function(e) {
    	console.log('onPlayerStateChange', e);
    }

  };

  // ------End Youtube Functionality Definition-------



	// default search text
	$scope.searchText = 'I\'m Yours';

	// default results
	$scope.results = [
		{
			title : 'I\'m Yours',
			artist : 'Jason Mraz',
			youtubeId : 'EkHTsc9PU2A',
			spotifyId : undefined
		}
	];

	$scope.playIndex = 0;
	$scope.fixedStart = 0;
	$scope.variableStart = 0;

	$scope.search = function() {

		$http.get( composeLastFMTrackSearch($scope.searchText) ).success(function (data) {
			console.log('lastfm api call worked', data);
			//$scope.results = data.results.trackmatches.track;
			var title = data.results.trackmatches.track[0].name;
			var artist = data.results.trackmatches.track[0].artist;

			$http.get( composeLastFMTrackGetSimilar(title, artist, 25) ).success(function (data2) {
				console.log('lastfm api call 2 worked', data2);
				$.each(data2.similartracks.track, function(index, el) {
					$scope.results.push({
						title : el.name,
						artist : el.artist.name
					});
				});

			});
		});

	};

	$scope.play = function() {
		if (!$scope.results[0].youtubeId) {
			$scope.getYoutubeIds();
		}

		if (!player) {
			MyYoutubeObject.load(container, $scope.results[0].youtubeId);
		}

		$scope.getYoutubeIds();

	};

	$scope.skip = function() {
		$scope.playIndex++;
		if (!player) {
			return;
		}
		if (!$scope.results[$scope.playIndex].youtubeId) {
			$scope.getYoutubeIds();
		}

		player.loadVideoById($scope.results[$scope.playIndex].youtubeId);
	};





	$scope.getYoutubeIds = function() {
		angular.forEach($scope.results, function(result) {
			if (!result.youtubeId) {
				$http.jsonp( composeYoutubeVideoSearch(result.title, result.artist) ).success(function (data) {
					result.youtubeId = data.feed.entry[0].media$group.yt$videoid.$t;
				});
			}
		});

	};


	// Compose API queries

	// LastFM
	var composeLastFMTrackSearch = function(searchTerm) {
		var query ='';
			var base = 'http://ws.audioscrobbler.com/2.0/?method=track.search';
			var apiKey = '7a1e356a7279fca06252bc4e5cebccb2';

			query = query + base;
			query = query + '&track=';
			query = query + searchTerm;
			query = query + '&api_key=';
			query = query + apiKey;
			query = query + '&format=json';

			return query;
	};

	var composeLastFMTrackGetSimilar = function(title, artist, limit) {
		var query ='';
			var base = 'http://ws.audioscrobbler.com/2.0/?method=track.getsimilar';
			var apiKey = '7a1e356a7279fca06252bc4e5cebccb2';

			query = query + base;
			query = query + '&artist=';
			query = query + artist;
			query = query + '&track=';
			query = query + title;
			query = query + '&limit=';
			query = query + limit;
			query = query + '&api_key=';
			query = query + apiKey;
			query = query + '&format=json';

			return query;
	};

	// Youtube
	var composeYoutubeVideoSearch = function(title, artist) {
		var query ='';
		var base = 'https://gdata.youtube.com/feeds/api/videos?q=';

		query = query + base;
		query = query + title + ' ';
		query = query + artist;
		query = query + '&max-results=2';
		query = query + '&v=2&alt=json-in-script&callback=JSON_CALLBACK';

		return query;
	};

	// Spotify
	var composeSpotifyTrackSearch = function() {

	};

	$scope.findOnSpotify = function() {

		// methods for making different api queries
		var composeSpotifyTrackSearchQuery = function(title, artist) {
			var query ='';
			var base = 'http://ws.spotify.com/search/1/track.json?q=';

			query = query + base;
			query = query + title + ' ';
			query = query + artist;

			return query;
		};

		angular.forEach($scope.results, function(result) {
			if (result.toFindOnSpotify) {
				$http.get( composeSpotifyTrackSearchQuery(result.title, result.artist), { headers: { 'X-Requested-With' : undefined } } ).success(function (data) {
					console.log('spotify api call worked', data);
				});
			}
		});

	};



}