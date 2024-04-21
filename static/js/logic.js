// Store API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let tectonicurl=" https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function setColors(depth) {
    return depth > 90
    ? "#b72121"  
    : depth > 70
    ? "#b75921"  
    : depth > 50
    ? "#b78721"  
    : depth > 30
    ? "#b7a821" 
    : depth > 10
    ? "#b7b721"  
    : "#97b721";

    
  };
      

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup("Magnitude:" +feature.properties.mag+"<br>Depth:"+
    feature.geometry.coordinates[2]+"<br>Location: "+feature.properties.place+
    "<br>Time:"+new Date(feature.properties.time));
    
  };

  function pointToLayer(feature, latlng) {
   
    return L.circleMarker(latlng, {
        radius: setRadius(feature.properties.mag),
        color: "black",
        fillColor: setColors(feature.geometry.coordinates[2]),
        fillOpacity: 0.7
      });


  };

  function setRadius(mag) {

   
    if ( mag === 0) {
        return 3;
    }
    
  
    else {
        return mag*3;
    }
};

    
     
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
  
};

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let stalletile = L.tileLayer('https://example.com/{z}/{x}/{y}.png', {
    attribution: 'StalleTile'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Stalletile": stalletile
  };

  let tectonic = new L.LayerGroup();

  d3.json(tectonicurl).then(function (response) {
    //tect.addData(response);
    L.geoJSON(response,{
      color:"orange",
      weight:"2"
    }).addTo(tectonic)
    
  });

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
    Tectoniclayer:tectonic
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
 var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  createLegend(myMap);

};
function createLegend(myMap) {
    

    var legend =L.control({
        position: "bottomright"
    });
    legend.onAdd= function(){
        var div = L.DomUtil.create("div", "legend");
        var magnitudes = [-10, 10, 30, 50, 70, 90];
        var colors = [
            setColors(magnitudes[0]),  // Corresponding to depth > -10
            setColors(magnitudes[1]),  // Corresponding to depth > 10
            setColors(magnitudes[2]),  // Corresponding to depth > 30
            setColors(magnitudes[3]),  // Corresponding to depth > 50
            setColors(magnitudes[4]),  // Corresponding to depth > 70
            setColors(magnitudes[5]),  // Corresponding to depth > 90
        ];
    
    
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
              '<i style="background:' +
              colors[i] +
              '"></i> ' +
              magnitudes[i] +
              (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
          }
        return div;
    };
    legend.addTo(myMap);

};