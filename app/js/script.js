const testString = 'This is a test!';
console.log(testString);

const apiKey = 'pk.eyJ1IjoiYm1kMyIsImEiOiJja3BnNXl1encwMTBqMm9xZ3VsbHBsM203In0.Tk6ziR8JwEDSoF7savjM3A'
var myBounds = new L.LatLngBounds(new L.LatLng(-90, -200), new L.LatLng(90, 200));
var markers =  new L.markerClusterGroup();
var clusterOff = new L.featureGroup();

$(document).ready(function() { //initialize select2 on dropdown
  $('.js-example-placeholder-single').select2({
    placeholder: "Proxy Location",
    allowClear: true
  });
  $('.js-example-basic-multiple[name="timescales[]"]').select2({
    placeholder: "Timescale",
    allowClear: true
  });
  $('.js-example-basic-multiple[name="seasonality[]"]').select2({
    placeholder: "Seasonality",
    allowClear: true
  });
});

//initialize map
var mymap = new L.map('mapid', {
  center: [30,0],
  zoom: 1.3,
  zoomSnap: 0.1,
  maxBoundsViscosity: 0.85,
  maxBounds: myBounds
});

//add mapbox layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,  
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiKey
}).addTo(mymap);

//onclick function for marker, ticks off checkbox
function checkMarker(e) {
    //get popup and its content
    var popup = e.target.getPopup();
    var content = popup.getContent();
    //extract SiteID from the popup contrent
    var tempSplit = content.split('Site ID: ');
    var temp2 = tempSplit[1].split('<');
    var clickID = temp2[0];
    //get element with id that is same as clickID
    //want the 2nd indexed element (1st is the label, checkbox is contained in the input tag though)
    var mapElem = document.querySelectorAll('[id=' + clickID + ']')[0];
    $('.js-example-placeholder-single').val(null).trigger('change');//get rid of existing selection
    //check and uncheck on click
    mapElem.selected = !mapElem.selected;
    //$(".js-example-placeholder-single").val(clickID);
    //$(".js-example-placeholder-single").trigger('change.select2');
}

var select3 = document.getElementById("dDown");
var markerDict = {};

//path to csv of iso2k sites
$.get('../.././iso2kp2.csv', function(csvString) {

    // Use PapaParse to convert string to array of objects
    var data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;
    // For each row in data, create a marker and add it to the map
    // For each row, columns `Latitude`, `Longitude`, and `Title` are required
    for (var i in data) {
      var row = data[i];
      //MARKERS SECTION
      //if statement prevents marker error
      if (row.SiteID1 == null) {
        continue;
      }
      var marker =  new L.marker([row.SiteLat, row.SiteLon], {
        opacity: 1
      }).bindPopup("<h4><b>" + row.SiteName + "</b><br> Site ID: " + row.SiteID1 + "</h4>").on('click', checkMarker);
      markerDict[row.SiteID1] = marker;
      markers.addLayer(marker);
      clusterOff.addLayer(marker);

      //FILTER SECTION
      var optionNew = document.createElement("option");
      [optionNew.value, optionNew.id] = [row.SiteID1, row.SiteID1];
      optionNew.className = 'locCheck';
      select3.appendChild(optionNew);
      optionNew.appendChild(document.createTextNode(row.SiteName + " (" + row.SiteID1 + ")"));
    }
    mymap.addLayer(markers); //use this for clusters
});
//attribution for the csv function from HandsOnDataViz
//mymap.attributionControl.setPrefix(
//  'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
//);

//responsive clusters w/ zoom and move events
function updateBoxes(markers) {
  //display hides and collapses (visibility just hides)
  for (let el of document.querySelectorAll('.locCheck')) el.disabled = 'disabled';
  $(".js-example-placeholder-single").trigger('change');

  //add some sort of if statement in for loop to check whether current index is a markerCluster or marker
  for (var i=0; i < markers.length; i++) {
    var popup = markers[i].getPopup();
    if (popup != null) {
      var content = popup.getContent();
      var tempSplit = content.split('Site ID: ');
      var temp2 = tempSplit[1].split('<');
      var clickID = temp2[0];
      //elemens is an array (querySelectorAll returns multiple if present)
      //var elemens = document.querySelectorAll('[id=' + clickID + ']');
      //document.querySelector('[id=' + clickID + ']').disabled = 'enabled';
      //$('select id:' + clickID).prop('disabled', false);
      //$("#dDown").find('id:' + clickID)[0].prop('disabled', false);
      console.log($("#dDown").find('id:' + clickID));
      $("#dDown").find('id:' + clickID).prop('disabled', false);//maybe this will enable the options
      $('#dDown').trigger('change');
      //$('#' + clickID).select2().prop("disabled", false);
      /*for (var k = 0; k < elemens.length; k++) {
        //elemens[k].style.display = 'inline-block';        
      }end of for loop */
    }
    else { //markers[i] is a cluster  
      var childMarkers = markers[i].getAllChildMarkers();
      for (var l=0; l < childMarkers.length; l++) {
        var popup = childMarkers[l].getPopup();
        var content = popup.getContent();
        var tempSplit = content.split('Site ID: ');
        var temp2 = tempSplit[1].split('<');
        var clickID = temp2[0];
        console.log($("#dDown").find('id:' + clickID));
        $("#dDown").find('id:' + clickID).prop('disabled', false);//maybe this will enable the options
        $('#dDown').trigger('change');
        //elemens is an array (querySelectorAll returns multiple if present)
        //var elemens = document.querySelectorAll('[id=' + clickID + ']');
        //for (var k = 0; k < elemens.length; k++) {
          //elemens[k].style.display = 'inline-block';
        //}
      }
    }
  }
} 

function logVisibleClusters() {
  var parent;
  var visibleClusterMarkers = [];
  var clustArray = [];
  var bounds = mymap.getBounds();
  markers.eachLayer(function (marker) {
    parent = markers.getVisibleParent(marker);
    if (parent && (typeof visibleClusterMarkers[parent._leaflet_id] == 'undefined')) {
      visibleClusterMarkers[parent._leaflet_id] = parent;
    }
  });
  visibleClusterMarkers.forEach(function(clusterMarker) {
    if (bounds.contains(clusterMarker._latlng)) {
      clustArray.push(clusterMarker);
    }
  });
  updateBoxes(clustArray);
}

/*
mymap.on('moveend', function(e) {
  setTimeout(logVisibleClusters, 1000);
});
mymap.on('zoomend', function(e) {
  setTimeout(logVisibleClusters, 1000);
});
*/

//JS FOR FORM SUBMISSION
var locationParams, seasonParams, timescaleParams;
function downloadSubmit() {
  //get checked values
  siteID = $("#dDown").find(':selected')[0].value;
  console.log(siteID);
  seasonParams = $('.js-example-basic-multiple[name="seasonality[]"]').select2('data');
  console.log(seasonTest);
  timescaleParams = $('.js-example-basic-multiple[name="timescales[]"]').select2('data');
  console.log(timeTest);
  
  if (siteID == null || seasonParams == null || timescaleParams == null 
    || seasonParams.length == 0 || timescaleParams.length == 0 || siteID.length == 0) {
    //missing a filter
    alert('Please select at least one checkbox for each filter.');
    document.getElementById('dload').reset(); //reset values
    return false;
  }
  else {
    //first, get array of all season + time combos
    /*
    var concatCombos = [];
    var seasonality, searchSubString, timeScale;
    //var markerLat, markerLng, path, siteID, tempPath;
    for (var j = 0; j < seasonParams.length; j++) {
      //do this for each season
      seasonality = seasonParams[j].id;
      for (var k = 0; k < timescaleParams.length; k++) {
        timeScale = timescaleParams[k].id;
        searchSubString = seasonality.concat(timeScale);
        concatCombos.push(searchSubString);
      }
    }
    
    var locationFilepathArray = [];
    //for (var i = 0; i < locationParams.length; i++) {
      //do this for each location
      path = "/figures/"
      path = path.concat(siteID + "/site_dynamics_");

      //now, need lat+lon of location for end of filepath
      markerLat = markerDict[siteID].getLatLng().lat;
      markerLng = markerDict[siteID].getLatLng().lng;
      if (markerLng < 0) { //leaflet markers and filenames have diff. longitudes
        markerLng = markerLng + 360;
      }

      for (var b = 0; b < concatCombos.length; b++) {
        tempPath = path.concat(concatCombos[b]);
        tempPath = tempPath.concat(markerLat + "_" + markerLng);
        tempPath = tempPath.concat(".png");
        locationFilepathArray.push(tempPath);  
      }
      
      console.log("Location filepath array: " + locationFilepathArray);
    //} 
    /*
    link = document.createElement("a"); //create 'a' element
    link.setAttribute("href", "iso2kp2.csv"); //replace "file" with link to file you want to download
    link.setAttribute("download", "iso2kp2.csv");// replace "file" here too
    link.click();
    
   //this for loop works, but for now we don't want downloads enabled
   for (var l = 0; l < locationFilepathArray.length; l++) {
     currentPath = locationFilepathArray[l];
     link = document.createElement("a");
     console.log(currentPath);
     link.setAttribute("href", currentPath);
     link.setAttribute("download", currentPath.split("/")[3]); //commenting this out should fix filenaming conventions (Download arg is the name it gives the file)
     link.click();
   }
   */
   
    //reset form values after downloading figures for user
    document.getElementById('dload').reset();
    return false;
  }

}

$(document).ready(function () {
  // add bootstrap table styles to pandoc tables
  $('tr.header').parent('thead').parent('table').addClass('table table-condensed');
  // initialize mathjax
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src  = "https://mathjax.rstudio.com/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML";
  document.getElementsByTagName("head")[0].appendChild(script);
});