function LandingCtrl($scope, $rootScope, loader) {
  $scope.places = [];

  function getPlaces() {
    loader.sl();
    var query = BuiltApp.Class('places').Query();
    query.exec()
    .then(function(data) {
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
    console.log('Current Selection ', $scope.currentSelection)
    if (!$scope.currentSelection)
      return alert('None Selected!');

    // removing the marker
    $scope.currentSelection.marker.setMap(null);
    $scope.currentSelection.delete()
      .then(function() {
        getPlaces();
        $scope.currentSelection = null;
      }, function(){
        alert('Couldn\'t delete that!');
      })
    $scope.currentSelection = null;
  }

  $scope.create = function(location) {
    var name = prompt('Enter place name:');

    if (!name)
      return;

    loader.sl();
    var Cls = BuiltApp.Class('places').Object;
    var obj = Cls();
        obj = obj.set('name', name).setLocation(location);
        obj.save()
          .then(function(){
            loader.hl();
            getPlaces();
          });
  }
}