
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
    allowClear: false
  });
  $('.js-example-basic-multiple[name="seasonality[]"]').select2({
    placeholder: "Seasonality",
    allowClear: false
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
    $('.js-example-placeholder-single').val(null).trigger('change');//get rid of existing selection
    //check and uncheck on click
    if (e.type == 'popupopen') {
      //trigger selection of proxy location of popup
      $(".js-example-placeholder-single").val(clickID).trigger('change');//this should select the opened popup
    }
}

var select3 = document.getElementById("dDown");
var markerDict = {};
var lngDict = {};

//path to csv of iso2k sites
$.get('../.././iso2knew.csv', function(csvString) {

    // Use PapaParse to convert string to array of objects
    var data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;
    // For each row in data, create a marker and add it to the map; columns `Latitude`, `Longitude`, and `Title` are required
    for (var i in data) {
      var row = data[i];
      //MARKERS SECTION
      //if statement prevents marker error
      if (row.SiteID1 == null) {
        continue;
      }
      var marker =  new L.marker([row.SiteLat, row.SiteLonAdj], {
        opacity: 1
      }).bindPopup("<h4><b>" + row.SiteName + "</b><br> Site ID: " + row.SiteID1 + "</h4>").on('popupopen', checkMarker).on('popupclose', checkMarker);

      markerDict[row.SiteID1] = marker;
      lngDict[row.SiteID1] = row.SiteLon;
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
  $('.js-example-placeholder-single option').prop('disabled', true);
  $(".js-example-placeholder-single").trigger('change');

  //add some sort of if statement in for loop to check whether current index is a markerCluster or marker
  for (var i=0; i < markers.length; i++) {
    var popup = markers[i].getPopup();
    if (popup != null) {
      var content = popup.getContent();
      var tempSplit = content.split('Site ID: ');
      var temp2 = tempSplit[1].split('<');
      var clickID = temp2[0];
      $('.js-example-placeholder-single option[value="' + clickID + '"]').prop('disabled',false);
      $(".js-example-placeholder-single").trigger('change');
    }
    else { //markers[i] is a cluster  
      var childMarkers = markers[i].getAllChildMarkers();
      for (var l=0; l < childMarkers.length; l++) {
        var popup = childMarkers[l].getPopup();
        var content = popup.getContent();
        var tempSplit = content.split('Site ID: ');
        var temp2 = tempSplit[1].split('<');
        var clickID = temp2[0];
        $('.js-example-placeholder-single option[value="' + clickID + '"]').prop('disabled',false);
        $(".js-example-placeholder-single").trigger('change');
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

mymap.on('moveend', function(e) {
  setTimeout(logVisibleClusters, 1000);
});
mymap.on('zoomend', function(e) {
  setTimeout(logVisibleClusters, 1000);
});

function generateZip(links, siteID) {
  var zip = new JSZip();
  var count = 0;  
  var zipFilename = siteID + '.zip';
  console.log("the zip file is called: " + zipFilename);
  links.forEach(function (url, i) {
    
    var filePath = links[i];
    filename = filePath.split("/")[3];
    //filename = filename.replaceAll(".", "_"); //are periods prohibited in filenames? if not, remove this line
    filename = filename.concat('.png');
    console.log("filename in generateZip function: " + filename);
    console.log("whole path: " + filePath);
    /*JSZipUtils.getBinaryContent(filePath, function (err, data) {
      if (err) {
        throw err;
      }
      zip.file(filePath, data, {binary:true});
    });*/

    zip.file(filename, filePath);
    count++;
    console.log(count);
    
    if (count == links.length) {
      //we have reached the last file to download
      zip.generateAsync({type:"blob"})
        .then(function (content) {
          saveAs(content, zipFilename);
        });
    }
    
  }); 
}

var countDecimals = function (value) {
  if(Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0; 
}

//JS FOR FORM SUBMISSION
var locationParams, seasonParams, timescaleParams;
function downloadSubmit() {
  //get checked values
  siteID = $("#dDown").find(':selected')[0].value;
  seasonParams = $('.js-example-basic-multiple[name="seasonality[]"]').select2('data');
  timescaleParams = $('.js-example-basic-multiple[name="timescales[]"]').select2('data');
  
  if (siteID == null || seasonParams == null || timescaleParams == null 
    || seasonParams.length == 0 || timescaleParams.length == 0 || siteID.length == 0) {
    //missing a filter
    alert('Please select at least one option for each filter before hitting download.');
    $('.js-example-placeholder-single').val(null).trigger('change');
    $('.js-example-basic-multiple').val(null).trigger('change');
    return false;
  }
  else {
    //first, get array of all season + time combos
    var concatCombos = [];
    var seasonality, searchSubString, timeScale;
    var markerLat, markerLng, path, siteID, tempPath;
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
    path = "./figures/"
    path = path.concat(siteID + "/site_dynamics_");

    //now, need lat+lon of location for end of filepath
    markerLat = markerDict[siteID].getLatLng().lat; //ok to use lat from marker
    markerLng = lngDict[siteID];

    for (var b = 0; b < concatCombos.length; b++) {
      tempPath = path.concat(concatCombos[b]);
      tempPath = tempPath.concat(markerLat + "_" + markerLng);
      tempPath = tempPath.concat(".png");
      locationFilepathArray.push(tempPath);  
    }
    
    //console.log("Location filepath array: " + locationFilepathArray);
    //generateZip(locationFilepathArray, siteID);
    
   //this for loop works, but for now we don't want downloads enabled
    for (var l = 0; l < locationFilepathArray.length; l++) {
     currentPath = locationFilepathArray[l];
     link = document.createElement("a");
     console.log(currentPath);
     link.setAttribute("href", currentPath);
     link.setAttribute("download", currentPath.split("/")[3]); //commenting this out should fix filenaming conventions (Download arg is the name it gives the file)
     link.click();
    }
    //reset form values after downloading figures for user
    $('.js-example-placeholder-single').val(null).trigger('change');
    $('.js-example-basic-multiple').val(null).trigger('change');
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