mapboxgl.accessToken = 'pk.eyJ1IjoiaW9zZXJ2aWNlZGVzayIsImEiOiJjanZvaXVhejkxdDh5NDhwYmxqbzE0MmZqIn0.-wFzMVbZTxRePP3py2QbXA'; //Mapbox token 
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/ioservicedesk/cjyfq2zsf56wl1ds8p1hc6xb2', //stylesheet location
    center: [9.351904112498005, 28.82253746715162], // starting position
    zoom: 1.67,// starting zoom
});

var colorPicker = document.getElementById('color-picker');

var object
map.on('load', function(e) {
    map.addSource('csvData', {
        type: 'geojson',
        data: {"type":"FeatureCollection","features":[]},
      });
 
    // unclustered layer
    map.addLayer({
        id: 'csvData',
        type: 'circle',
        source:'csvData',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': "#11BAE0",
          'circle-radius': ['interpolate', 
                    ['linear'],
                    ["get", "Keys"],
                    0,
                    5,
                    5,
                    7,
                    10,
                    10,
                    20,
                    12
                ],
        //   'circle-radius':6,
          'circle-opacity':0.9
        }
        
    });
    
    // text

    map.addLayer({
        id: 'cluster-labels',
        type: 'symbol',
        source: 'csvData',
        filter: ['!', ['has', 'point_count']],
        paint:{
            'text-halo-color':'#fff',
            'text-halo-width':1.3,
        },
        layout: {
            'text-field': '{City}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-radial-offset': 0.65,
            'text-size': 10,
            // 'text-offset':[2, 0]
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
        var description = "<div class='popup-container'><h3>" + feature.properties.Name + "</h3>" + 
                        "<h4>" + "<b>" + "Hubs" + "</b>" + feature.properties.Keys + "</h4> </div>";
        
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
    });

    fetchData();

});

// fetch the data from googlsheets
function fetchData() {
    $.ajax({
        type: "GET",
        //YOUR TURN: Replace with csv export link
        url:'https://docs.google.com/spreadsheets/d/e/2PACX-1vTqoC347N4Ds1G9pdGyWEIWyLG3u05K9CeLD8KkAU9xOZUh895yZDH1PN64Ad8bJ3gCpSljICJ_h7Df/pub?output=csv',
        dataType: "text",
        success: function (csvData) { makeGeoJSON(csvData); },
        error:function(error) { console.log(error) }
    });
}

function makeGeoJSON(csvData) {

    csv2geojson.csv2geojson(csvData, {
        latfield: 'lat',
        lonfield: 'lng',
        delimiter: ','
      }, function (err, data) {
          console.log(data);
        
        //   update keys to integer
        data.features.forEach(element => {
            element.properties.Keys = parseInt(element.properties.Keys);
        });
          let geocodedData = geocodeAddress(data);
        //   map.getSource('csvData').setData(geocodedData);
      }
    );
}

// geocode the data
function geocodeAddress(dataItems) {
    var itemsCount = dataItems.features.length - 1;
    dataItems.features = dataItems.features.map((feature,i) => {
        let url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+feature.properties.City+' '+ feature.properties.Country+'.json?&access_token='+mapboxgl.accessToken;
      
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                if(data.features.length == 0) {
                    // return feature;
                } else {
                    feature.geometry.coordinates = data.features[0].geometry.coordinates;
                }

                if(i == itemsCount) {
                    console.log("Complete");
                    console.log(dataItems);

                    map.getSource('csvData').setData(dataItems);

                    // update the point radius
                }
            })
            .catch(error => {
                console.log(error);
            });

            return feature;
    });

    console.log(dataItems);
    return dataItems;
    
}

