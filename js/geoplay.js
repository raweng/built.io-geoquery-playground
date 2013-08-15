var u = function(u) {return 'markup/'+u}

angular.module('geoplay', []).
config(function($routeProvider, $httpProvider) {
  $routeProvider.
    when('/', {controller: LandingCtrl, templateUrl: u('landing.html')}).
    when('/query', {controller: QueryCtrl, templateUrl: u('query.html')}).
    otherwise({redirectTo:'/'});
}).
directive('gmap', _gmap_directive).
directive('loader', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      scope.show = false;
      var requests = [];

      scope.$on('showLoader', function() {
        $sa(scope, function() {scope.show = true;})
        requests.push(1);
      });

      scope.$on('hideLoader', function() {
        requests.pop();
        if (requests.length == 0)
          scope.show = false;
      })
    }
  }
}).
factory('loader', ['$rootScope', function($rootScope) {
  return {
    sl: function() {
      return $rootScope.$broadcast('showLoader');
    },
    hl: function() {
      return $rootScope.$broadcast('hideLoader');
    }
  }
}]).
filter('multiples', function() {
  return function(num) {
    if (num == 0)
      return 'No places found';
    else if (num == 1)
      return num + ' place found';
    else
      return num + ' places found';
  }
}).
directive('dialog', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $(element).modal({show: false});

      scope.$on('showDialog', function(scp, code) {
        $(element).modal('show');
        scope.code = code;
      });
    }
  }
});

// initialize built
Built.initialize('blta660637a0d9a2f8c', 'geop');

// the safe apply function
function $sa(scope, fn) {
  (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}

function latLong(l) {
  l = l || [0, 0];
  return new google.maps.LatLng(l[1], l[0]);
}

function longLat(l) {
  return new Built.Location([l.lng(), l.lat()]);
}