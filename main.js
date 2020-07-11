mapboxgl.accessToken = 'pk.eyJ1IjoiaW9zZXJ2aWNlZGVzayIsImEiOiJjanZvaXVhejkxdDh5NDhwYmxqbzE0MmZqIn0.-wFzMVbZTxRePP3py2QbXA'; //Mapbox token 
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/ioservicedesk/cjyfq2zsf56wl1ds8p1hc6xb2', //stylesheet location
    center: [23.971756293963494, 30.03581303071013], // starting position
    zoom: 1.67,// starting zoom
});

var colorPicker = document.getElementById('color-picker');

map.on('load', function(e) {
    map.addSource('csvData', {
        type: 'geojson',
        data: 'data.geojson',
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
          'circle-color': "#00d8f5",
          'circle-radius': ["get", "Count"],
          'circle-opacity':0.8
        }
        
    });

    
    // add popup layer
    map.on('click', 'csvData', function(e) {
        // get the feature
        var features = map.queryRenderedFeatures(e.point, {layers:['csvData']});

        if(!features[0]) {
            return;
        }

        let feature = features[0];

        // create a popupContent
        var description = "<div class='popup-container'><h3>" + feature.properties.NAME + "</h3>" + 
                        "<h4>" + "<b>" + "Hubs" + "</b>" + feature.properties.Count + "</h4> </div>";
        
        let coord = feature.geometry.coordinates;
        new mapboxgl.Popup()
            .setLngLat(coord)
            .setHTML(description)
            .addTo(map);
    });


    map.on('mouseenter', 'csvData', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'csvData', function () {
        map.getCanvas().style.cursor = '';
    });

    // update the color
    colorPicker.addEventListener('input', function(e) {
        map.setPaintProperty('csvData', 'circle-color', e.target.value);
    })

});
