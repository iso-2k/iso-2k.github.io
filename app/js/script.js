const testString = 'This is a test!';
console.log(testString);

const apiKey = 'pk.eyJ1IjoiYm1kMyIsImEiOiJja3BnNXl1encwMTBqMm9xZ3VsbHBsM203In0.Tk6ziR8JwEDSoF7savjM3A'
//0, 0 is lat long coord for center of the world
var myBounds = new L.LatLngBounds(new L.LatLng(-89.98155760646617, -180), new L.LatLng(89.99346179538875, 180));
var markers =  new L.markerClusterGroup();
var clusterOff = new L.featureGroup();

//initialize map
var mymap = new L.map('mapid', {
  center: [30,0],
  zoom: 1.4,
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
    //we want the 2nd indexed element (1st is the label, checkbox is contained in the input tag though)
    var mapElem = document.querySelectorAll('[id=' + clickID + ']')[1];
    //check and uncheck on click
    mapElem.checked = !mapElem.checked;
}

var select1 = document.getElementById("checkBoxesLoc");

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
      markers.addLayer(marker);
      clusterOff.addLayer(marker);
      //marker.addTo(mymap); use this for map w/o clusters

      //FILTER SECTION
      var aLabel = document.createElement("label");
      var el1 = document.createElement("input");
      el1.type = "checkbox";
      aLabel.htmlFor = row.SiteID1;
      aLabel.className = 'locCheck';
      el1.className = 'locCheck';
      aLabel.id = row.SiteID1;
      el1.id = row.SiteID1;
      el1.value = row.SiteID1;
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
var show = true;
function showCheckboxes(num) {
  var checkboxes = document.getElementById("checkBoxes");
  var checkboxes2 = document.getElementById("checkBoxes2");
  var checkboxesLoc = document.getElementById("checkBoxesLoc");

  if (show) {
    if (num == 1){
      checkboxes.style.display = "block";
    }
    else if (num == 'l') {
      checkboxesLoc.style.display = "block";
    }
    else {
      checkboxes2.style.display = "block";
    } 
    show = false;
  } else {
    if (num == 1) {
      checkboxes.style.display = "none";
    }
    else if (num == 'l') {
      checkboxesLoc.style.display = "none";
    }
    else {
      checkboxes2.style.display = "none";
    }
    show = true;
  }
}

//responsive clusters w/ zoom and move events
function updateBoxes(markers) {
  //display hides and collapses (visibility just hides)
  for (let el of document.querySelectorAll('.locCheck')) el.style.display = 'none';

  //add some sort of if statement in for loop to check whether current index is a markerCluster or marker
  for (var i=0; i < markers.length; i++) {
    //console.log(markers[i]);
    //if (markers[i] = a marker) DO THIS
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

function ajaxgo() {
  var data = new FormData();
  //data.append("locations", document.getElementById().value);
  //data.append("seasons", document.getElementById().value);
  //data.append("times", document.getElementById('checkBoxes2').getElementsByTagName('input'));
  var checkedTimes = document.querySelectorAll('.timeCheck:checked');
  var checkedSeasons = document.querySelectorAll('.seasonCheck:checked');
  var checkedLocations = document.querySelectorAll('.locCheck:checked');
  var locations, seasons, times = [];
  for (var i = 0; i < checkedLocations.length; i++) {
    locations.append(checkedLocations[i].value);
  }
  for (var j = 0; j < checkedSeasons.length; j++) {
    seasons.append(checkedSeasons[j].value);
  }
  for (var k = 0; k < checkedTimes.length; k++) {
    times.append(checkedTimes[k].value);
  }

  console.log(locations);

  //AJAX
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "../.././dummy.php");
  xhr.onload = function() {
    console.log("This.response: " + this.response);
    if (this.response == "OK") {
      document.getElementById('dload').reset();
      alert("ok");
    }
    else {
      //document.getElementById('dload').reset();
      alert('something happened here');
    }
  }
  xhr.send(data);
  //prevent html form submit
  return false;
}

function formDownload() {
  //use siteid1 to navigate folder structure
  var http = new XMLHttpRequest();
  http.open("POST", "formHandler.py", true);
  http.setRequestHeader("Content-type", "application");
  var params = "search=" + document.querySelectorAll('#checkBoxes:checked').value;
  console.log(params);
  http.send(params);
  http.onload = function() {
    alert(http.responseText);
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