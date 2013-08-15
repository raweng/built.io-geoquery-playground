var _gmap_directive = function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      function see(map) {
        scope.$watch('places', function(newval, oldval) {
          newval.map(function(d) {
            var marker = new google.maps.Marker({
              position: latLong(d.get('__loc')),
              map: map,
              draggable: true,
              flat: true,
              title: d.get('name')||'Anonymous'
            });

            d.marker = marker;

            google.maps.event.addListener(marker, 'dragend', function(e) {
              // set the new location
              d.setLocation(longLat(e.latLng));
              d.save()
              .onSuccess(function(data) {
                $sa(scope, function() {
                  scope.currentSelection = d;
                });
              });
            });

            google.maps.event.addListener(marker, 'click', function(e) {
              $sa(scope, function() {
                scope.currentSelection = d;
              });
            });

            google.maps.event.addListener(marker, 'dragstart', function(e) {
              $sa(scope, function() {
                scope.currentSelection = d;
              });
            });
          });
        });

        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            drawingModes: [
              google.maps.drawing.OverlayType.MARKER,
            ]
          },
          markerOptions: {
            draggable: true
          }
        });

        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
          if (event.type != google.maps.drawing.OverlayType.MARKER)
            return;

          // set drawing back to hand
          drawingManager.setDrawingMode(null);
          var marker = event.overlay;
          scope.create(longLat(marker.position));
          marker.setMap(null);
        });
      }

      function query(map) {
        var options = {
          fillColor: '#1E90FF',
          fillOpacity: 0.5,
          strokeColor: '#1E90FF',
          strokeWeight: 1,
          clickable: true,
          editable: true,
          zIndex: 1,
          draggable: true
        }

        var setAttrs = function(overlay, type) {
          function set(desc, attributes) {
            overlay.description = desc;
            overlay.attributes = attributes;
          }
          function r(num) {
            return Math.round(num*10000)/10000;
          }
          function change(overlay) {
            if (type == google.maps.drawing.OverlayType.CIRCLE) {
              set('Circle, forming a $near query',
                'Centered at ' + r(overlay.center.lat()) + ',' + r(overlay.center.lng()) + 
                ', with a radius of ' + r(overlay.radius) + ' meters')
            } else {
              set('Polygon, forming a $within query',
                'Area of ' + r(google.maps.geometry.spherical.computeArea(overlay.getPath())) + ' sq. meters');
            }
          }
          change(overlay);

          // set click events
          google.maps.event.addListener(overlay, 'click', function(event) {
            $sa(scope, function() {
              scope.currentShape = overlay;
            });
          });

          var events = ['center_changed', 'radius_changed'];
          events.map(function(e) {
            google.maps.event.addListener(overlay, e, function() {
              $sa(scope, function() {
                change(overlay);
                scope.currentShape = null;
                scope.currentShape = overlay;
              });
            });
          })
        }

        // watch for changes in query results
        // and place markers on the map accordingly
        scope.$watch('places', function(newval, oldval) {
          scope.markers.map(function(m) {m.setMap(null)});
          scope.markers = [];

          newval.map(function(d) {
            var marker = new google.maps.Marker({
              position: latLong(d.get('__loc')),
              map: map,
              flat: true,
              title: d.get('name')||'Anonymous'
            });

            marker.setMap(map);
            scope.markers.push(marker);
          });
        });

        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: google.maps.drawing.OverlayType.CIRCLE,
          drawingControl: true,
          drawingControlOptions: {
            drawingModes: [
              google.maps.drawing.OverlayType.CIRCLE,
              google.maps.drawing.OverlayType.POLYGON
            ]
          },
          markerOptions: {
            icon: 'images/beachflag.png'
          },
          circleOptions: options,
          polygonOptions: options
        });
        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
          // set drawing back to hand
          drawingManager.setDrawingMode(null);
          setAttrs(event.overlay, event.type);
          // add the overlay to shapes array
          $sa(scope, function() {
            scope.currentShape = event.overlay;
            if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
              scope.nearShapes.push(event.overlay);
            } else {
              scope.withinShapes.push(event.overlay);
            }
          });
        });
      }

      function initialize() {
        google.maps.visualRefresh = true;
        var mapOptions = {
          center: new google.maps.LatLng(19.47400, 72.83000),
          zoom: 18,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(element[0],
            mapOptions);

        if (attrs.gmap == 'see')
          see(map);
        else
          query(map);
      }


      initialize();
    }
  };
}