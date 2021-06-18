const testString = 'This is a test!';
console.log(testString);
//import JSZip from 'jszip';
//import FileSaver from 'file-saver';

const apiKey = 'pk.eyJ1IjoiYm1kMyIsImEiOiJja3BnNXl1encwMTBqMm9xZ3VsbHBsM203In0.Tk6ziR8JwEDSoF7savjM3A'
//0, 0 is lat long coord for center of the world
var myBounds = new L.LatLngBounds(new L.LatLng(-90, -200), new L.LatLng(90, 200));
var markers =  new L.markerClusterGroup();
var clusterOff = new L.featureGroup();

//for select2 dropdown menu of proxy locations
$(".js-example-placeholder-single").select2({
  placeholder: "Proxy Location",
  allowClear: true
});

//initialize map
var mymap = new L.map('mapid', {
  center: [30,0],
  zoom: 1.3,
  zoomSnap: 0.1,
  maxBoundsViscosity: 0.8,
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
    //check and uncheck on click
    mapElem.selected = !mapElem.selected;
    $(".js-example-placeholder-single").val(clickID);
    $(".js-example-placeholder-single").trigger('change.select2');
}

var select2 = document.getElementById("dDown");
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
      select2.appendChild(optionNew);
      optionNew.appendChild(document.createTextNode(row.SiteName + " (" + row.SiteID1 + ")"));
    }
    mymap.addLayer(markers); //use this for clusters
});
//attribution for the csv function from HandsOnDataViz
//mymap.attributionControl.setPrefix(
//  'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
//);

//js for all 3 dropdowns
function showCheckboxes(num) {
  var checkboxes = document.getElementById("checkBoxes");
  var checkboxes2 = document.getElementById("checkBoxes2");
  //var checkboxesLoc = document.getElementById("checkBoxesLoc");

  if (num == 1){
    if (checkboxes.style.display == "block") { //if showing, change to not showing
      checkboxes.style.display = "none";
    }
    else {
      checkboxes.style.display = "block";
    }
    checkboxes2.style.display = "none";
    //checkboxesLoc.style.display = "none";
  }
  /*
  else if (num == 'l') {
    if (checkboxesLoc.style.display == "block") { 
      checkboxesLoc.style.display = "none";
    }
    else {
      checkboxesLoc.style.display = "block";
    }
    checkboxes2.style.display = "none";
    checkboxes.style.display = "none";
  }
  */
  else {
    if (checkboxes2.style.display == "block") { 
      checkboxes2.style.display = "none";
    }
    else {
      checkboxes2.style.display = "block";
    }
    checkboxes.style.display = "none";
    //checkboxesLoc.style.display = "none";
  } 
}

//responsive clusters w/ zoom and move events
function updateBoxes(markers) {
  //display hides and collapses (visibility just hides)
  for (let el of document.querySelectorAll('.locCheck')) el.disabled = 'disabled';

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
      $('select id:' + clickID).prop('disabled', false);
      //$('#' + clickID).select2().prop("disabled", false);
      /*for (var k = 0; k < elemens.length; k++) {
        if (elemens[k].tagName == 'label') {
          elemens[k].style.display = 'block';
        }
        else {
          elemens[k].style.display = 'inline-block';
        }
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
        //elemens is an array (querySelectorAll returns multiple if present)
        var elemens = document.querySelectorAll('[id=' + clickID + ']');
        for (var k = 0; k < elemens.length; k++) {
          /*if (elemens[k].tagName == 'label') {
            elemens[k].style.display = 'block';
          }
          else {
            elemens[k].style.display = 'inline-block';
          }*/
          elemens[k].style.display = 'inline-block';
        }
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

//JS FOR FORM SUBMISSION
var locationParams, seasonParams, timescaleParams;
function downloadSubmit() {
  //get checked values
  siteID = $("#dDown").find(':selected')[0].value;
  seasonParams = document.querySelectorAll('.seasonCheck:checked');
  timescaleParams = document.querySelectorAll('.timeCheck:checked');
  if (siteID == null || seasonParams == null || timescaleParams == null 
    || seasonParams.length == 0 || timescaleParams.length == 0) {
    //missing a filter
      alert('Please select at least one checkbox for each filter.');
    document.getElementById('dload').reset(); //reset values
    return false;
  }
  else {
    //first, get array of all season + time combos
    var concatCombos = [];
    var seasonality, searchSubString, timeScale;
    //var markerLat, markerLng, path, siteID, tempPath;
    for (var j = 0; j < seasonParams.length; j++) {
      //do this for each season
      seasonality = seasonParams[j].value;
      for (var k = 0; k < timescaleParams.length; k++) {
        timeScale = timescaleParams[k].value;
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