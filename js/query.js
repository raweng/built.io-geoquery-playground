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
    var query = new Built.Query('places');

    var queries = [];
    // get all the near queries
    $scope.nearShapes.map(function(shape) {
      var q = new Built.Query('places');
      q.nearLocation(longLat(shape.center), shape.radius);
      queries.push(q);
    });

    $scope.withinShapes.map(function(shape) {
      var q = new Built.Query('places');
      var coords = shape.getPath().getArray().map(function(l) {return longLat(l)});
      q.withInLocation(coords);
      queries.push(q);
    });
    
    query.or.apply(this, queries);
    return query;
  }

  $scope.show = function() {
    var query = queryBuilder().toJSON();
    var code = 'https://api.built.io/classes/places/objects?query=' + 
      JSON.stringify(query.query||{}, undefined, 2);

    $rootScope.$broadcast('showDialog', code);
  }

  $scope.query = function() {
    var query = queryBuilder();
    var check = query.toJSON().query;
    if (!check || check["$or"].length == 0)
      return $scope.places = [];

    loader.sl();
    query.exec().
    onSuccess(function(data) {
      loader.hl();
      $sa($scope, function() {
        $scope.places = data;
      })
    })
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