function QueryCtrl($scope, loader, $rootScope) {
  $scope.places = [];
  $scope.markers = [];
  $scope.nearShapes = [];
  $scope.withinShapes = [];
  $scope.currentShape = null;

  $scope.clear = function() {
    $scope.nearShapes.map(function(s) {s.setMap(null)});
    $scope.withinShapes.map(function(s) {s.setMap(null)});
    $scope.markers.map(function(s) {s.setMap(null)});
    $scope.nearShapes = [];
    $scope.withinShapes = [];
    $scope.places = [];
    $scope.currentShape = null;
  }

  var queryBuilder = function() {
    var query = BuiltApp.Class('places').Query();

    var queries = [];

    // get all the near queries
    $scope.nearShapes.map(function(shape) {
      var queryNearLocation = query.nearLocation(longLat(shape.center), shape.radius);
      queries.push(queryNearLocation);
    });

    $scope.withinShapes.map(function(shape) {
      var coords = shape.getPath().getArray().map(function(l) {return longLat(l)});
      var queryWithinLocation = query.withinLocation(coords);
      queries.push(queryWithinLocation);
    });

    var orQuery = query.or(queries);
    return orQuery;
  }

  $scope.show = function() {
    var query = queryBuilder().data;
    var code = 'https://api.built.io/classes/places/objects?query=' + 
      JSON.stringify(query.query||{}, undefined, 2);
    $rootScope.$broadcast('showDialog', code);
  }

  $scope.query = function() {
    var query = queryBuilder();
    var check = query.data.query;
    if (!check || check["$or"].length == 0){
      return $scope.places = [];
    }
    loader.sl();
    query.exec()
      .then(function(data) {
        loader.hl();
        $sa($scope, function() {
          $scope.places = data;
        })
    });
  }

  $scope.delete = function() {
    var shape = $scope.currentShape;
    if ($scope.nearShapes.indexOf(shape) != -1) {
      $scope.nearShapes.splice($scope.nearShapes.indexOf(shape), 1);
    } else {
      $scope.withinShapes.splice($scope.withinShapes.indexOf(shape), 1);
    }
    
    shape.setMap(null);
    $scope.currentShape = null;
  }
}