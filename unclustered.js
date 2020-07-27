mapboxgl.accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA'; //Mapbox token 
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/daudi97/ckcyd36dz1neo1ikdd63oacbu', //stylesheet location
    // style:'mapbox://styles/daudi97/ckd0mluv8166l1ilim6zkg2h4',
    center: [9.351904112498005, 28.82253746715162], // starting position
    zoom: 1.67,// starting zoom
});

var colorPicker = document.getElementById('color-picker');

// colors
var harmonyBlue =  '#00AEE9';
var harmonyGreen = '#69FABD';

var object;
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
          'circle-color': [
              "match",
              ["get", "Shared"],
              "FALSE",
              harmonyGreen,
              harmonyBlue
          ],
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
          'circle-opacity':0.7
        }
        
    });
    
    // text

    map.addLayer({
        id: 'cluster-labels',
        type: 'symbol',
        source: 'csvData',
        filter: ['!', ['has', 'point_count']],
        paint:{
            'text-color':'#fff'
        },
        layout: {
            'text-field': '{City}',
            'text-font': ["Nunito Bold Italic", "Arial Unicode MS Regular"],
            'text-variable-anchor': ['top', 'right'],
            'text-radial-offset': 0.65,
            'text-size': 11,
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

class LegendControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';

        var content = "<div class='legend'><div class='icon icon-green'></div> Individual validator"+
                    "<div class='icon icon-blue'></div> Collaborative validator</div>"
        this._container.innerHTML = content;
        return this._container;
    }
     
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

map.addControl(
    new LegendControl(),
    'bottom-right'
);
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

