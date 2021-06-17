const testString = 'This is a test!';
console.log(testString);

const apiKey = 'pk.eyJ1IjoiYm1kMyIsImEiOiJja3BnNXl1encwMTBqMm9xZ3VsbHBsM203In0.Tk6ziR8JwEDSoF7savjM3A'
//0, 0 is lat long coord for center of the world
var myBounds = new L.LatLngBounds(new L.LatLng(-90, -200), new L.LatLng(90, 200));
var markers =  new L.markerClusterGroup();
var clusterOff = new L.featureGroup();

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
    var mapElem = document.querySelectorAll('[id=' + clickID + ']')[1];
    //check and uncheck on click
    mapElem.checked = !mapElem.checked;
}

var select1 = document.getElementById("checkBoxesLoc");
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
      //marker.addTo(mymap); use this for map w/o clusters

      //FILTER SECTION
      var aLabel = document.createElement("label");
      var el1 = document.createElement("input");
      el1.type = "checkbox";
      //aLabel.htmlFor = row.SiteID1;el1.id = row.SiteID1;el1.value = row.SiteID1;
      aLabel.className = 'locCheck';
      el1.className = 'locCheck';
      [aLabel.id, el1.id, el1.value, aLabel.htmlFor] = [row.SiteID1, row.SiteID1, row.SiteID1, row.SiteID1];
      aLabel.appendChild(el1);
      select1.appendChild(aLabel);
      aLabel.appendChild(document.createTextNode(row.SiteName + " (" + row.SiteID1 + ")"));
    }
    mymap.addLayer(markers); //use this for clusters
    //markers.addTo(mymap)

});
//attribution for the csv function from HandsOnDataViz
//mymap.attributionControl.setPrefix(
//  'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
//);

//function myFunction() {
  //  document.getElementById("location").classList.toggle("show");
//}

//can be used to implement a search feature on a dropdown 
function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("location");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

//js for all 3 dropdowns
function showCheckboxes(num) {
  var checkboxes = document.getElementById("checkBoxes");
  var checkboxes2 = document.getElementById("checkBoxes2");
  var checkboxesLoc = document.getElementById("checkBoxesLoc");

  if (num == 1){
    if (checkboxes.style.display == "block") { //if showing, change to not showing
      checkboxes.style.display = "none";
    }
    else {
      checkboxes.style.display = "block";
    }
    checkboxes2.style.display = "none";
    checkboxesLoc.style.display = "none";
  }
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
  else {
    if (checkboxes2.style.display == "block") { 
      checkboxes2.style.display = "none";
    }
    else {
      checkboxes2.style.display = "block";
    }
    checkboxes.style.display = "none";
    checkboxesLoc.style.display = "none";
  } 
}

//responsive clusters w/ zoom and move events
function updateBoxes(markers) {
  //display hides and collapses (visibility just hides)
  for (let el of document.querySelectorAll('.locCheck')) el.style.display = 'none';

  //add some sort of if statement in for loop to check whether current index is a markerCluster or marker
  for (var i=0; i < markers.length; i++) {
    var popup = markers[i].getPopup();
    if (popup != null) {
      var content = popup.getContent();
      var tempSplit = content.split('Site ID: ');
      var temp2 = tempSplit[1].split('<');
      var clickID = temp2[0];
      //elemens is an array (querySelectorAll returns multiple if present)
      var elemens = document.querySelectorAll('[id=' + clickID + ']');
      for (var j = 0; j < elemens.length; j++) {
        elemens[j].style.display = 'block';
      }
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
          elemens[k].style.display = 'block';
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
  //clustArray holds the right number of elements on the screen (ie, 3 markers and a cluster of 5 reads as 4 )
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
  locationParams = document.querySelectorAll('.locCheck:checked'); //nodelist
  seasonParams = document.querySelectorAll('.seasonCheck:checked');
  timescaleParams = document.querySelectorAll('.timeCheck:checked');
  if (locationParams == null || seasonParams == null || timescaleParams == null 
    || locationParams.length == 0 || seasonParams.length == 0 || timescaleParams.length == 0) {
    //missing a filter
    alert('Please select at least one checkbox for each filter.');
    document.getElementById('dload').reset(); //reset values
    return true;
  }
  else {
    //alert('this would normally be a download, just testing');
    console.log("else condition triggered");
    //first, get array of all season + time combos
    var concatCombos = [];
    var seasonality, searchSubString, timeScale;
    for (var j = 0; j < seasonParams.length; j++) {
      //do this for each season
      seasonality = seasonParams[j].value;
      for (var k = 0; k < timescaleParams.length; k++) {
        timeScale = timescaleParams[k].value;
        searchSubString = seasonality.concat(timeScale);
        concatCombos.push(searchSubString);
      }
    }
    //alert('2 alert');
    console.log("here are the concatcombos: " + concatCombos);
    //now, loop through all locations and get all files with string concat combos in filename
    var markerLat, markerLng, path, siteID;
    var locationFilepathArray = [];
    for (var i = 0; i < locationParams.length; i++) {
      //do this for each location
      path = "/figures/"
      siteID = locationParams[i].value;
      path = path.concat(siteID + "/site_dynamics_");
      console.log("Path at line 255: " + path);

      //now, need lat+lon of location for end of filepath
      markerLat = markerDict[siteID].getLatLng().lat;
      markerLng = markerDict[siteID].getLatLng().lng;
      var tempPath;
      for (var b = 0; b < concatCombos.length; b++) {
        tempPath = path.concat(concatCombos[b]);
        tempPath = tempPath.concat(markerLat + "_" + markerLng);
        tempPath = tempPath.concat(".png");
        console.log("path inside for loop, 263: " + tempPath);
        locationFilepathArray.push(tempPath);  
      }
      
      console.log("Location filepath array: " + locationFilepathArray);
    }
    alert('do we get past the location loop?');
    /*
    link = document.createElement("a"); //create 'a' element
    link.setAttribute("href", "iso2kp2.csv"); //replace "file" with link to file you want to download
    link.setAttribute("download", "iso2kp2.csv");// replace "file" here too
    link.click();
    */
   for (var l = 0; l < locationFilepathArray.length; l++) {
     currentPath = locationFilepathArray[l];
     link = document.createElement("a");
     console.log(currentPath);
     link.setAttribute("href", currentPath);
     link.setAttribute("download", currentPath);
     link.click();
   }
    
    //reset form values
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