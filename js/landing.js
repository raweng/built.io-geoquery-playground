function LandingCtrl($scope, $rootScope, loader) {
  $scope.places = [];

  function getPlaces() {
    loader.sl();
    var query = new Built.Query('places');
    query.exec().
    onSuccess(function(data) {
      loader.hl();
      $sa($scope, function() {
        // remove old markers
        if ($scope.places) {
          $scope.places.map(function(p) {
            p.marker && p.marker.setMap(null);
          });
        }
        $scope.places = data;
      })
    });
  }

  getPlaces();

  $scope.deleteCurrent = function() {
    if (!$scope.currentSelection)
      return alert('None Selected!');

    // removing the marker
    $scope.currentSelection.marker.setMap(null);
    $scope.currentSelection.destroy().
    onSuccess(function() {
      getPlaces();
      $scope.currentSelection = null;
    }).
    onError(function() {
      alert('Couldn\'t delete that!');
    });
    $scope.currentSelection = null;
  }

  $scope.create = function(location) {
    var name = prompt('Enter place name:');

    if (!name)
      return;

    loader.sl();
    var Cls = Built.Object.extend('places');
    var obj = new Cls();
    obj.set('name', name);
    obj.setLocation(location);
    obj.save().
    onSuccess(function() {
      loader.hl();
      getPlaces();
    });
  }
}