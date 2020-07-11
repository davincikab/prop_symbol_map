mapboxgl.accessToken = 'pk.eyJ1IjoiaW9zZXJ2aWNlZGVzayIsImEiOiJjanZvaXVhejkxdDh5NDhwYmxqbzE0MmZqIn0.-wFzMVbZTxRePP3py2QbXA'; //Mapbox token 
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/ioservicedesk/cjyfq2zsf56wl1ds8p1hc6xb2', //stylesheet location
    center: [23.971756293963494, 30.03581303071013], // starting position
    zoom: 1.45,// starting zoom
});

map.on('load', function(e) {
    map.addSource('csvData', {
        type: 'geojson',
        data: '/data.geojson',
        // cluster:true,
        // clusterMaxZoom:14,
        // clusterRadius:50
      });
    
      map.addLayer({
        id: 'csvData',
        type: 'circle',
        source:'csvData',
        // filter:['has','point_count'],
        paint: {
          'circle-color': '#f28cb1',
          'circle-radius': ["get", "Count"]
        }
        
    });

    
    // add popup layer
    map.on('click', 'csvData', function(e) {
        // get the feature
        var features = map.queryRenderedFeature(e.point, {layer:['csvData']});

        if(!features[0]) {
            return;
        }

        let feature = features[0];

        // create a popupContent
        var description = "<div class='popup-container'><h3>" + feature.properties.NAME + "</h3>" + "<h4>" + "<b>" + "COMPANY: " + "</b> Hubs </h4>" + 
                        "<h4>" + "<b>" + "SCORE: " + "</b>" + feature.properties.Count + "</h4> </div>";
        
        let coord = feature.geometry.coordinates;
        new mapboxgl.PopUp()
            .setLatLng(coord)
            .setHTML(description)
            .addT(map);
    });


    map.on('mouseenter', 'csvData', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'csvData', function () {
        map.getCanvas().style.cursor = '';
      });

});
