$(document).ready(function() { //initialize select2 on dropdown
    $('.js-example-placeholder-single[name="timescales[]"]').select2({
      //placeholder: "Timescale",
      allowClear: false
    });
    $('.js-example-placeholder-single[name="seasonality[]"]').select2({
      //placeholder: "Seasonality",
      allowClear: false
    });
    $('.js-example-basic-multiple[name="mode_list[]"]').select2({
        allowClear: true,
        maximumSelectionLength: 20
      });
  });


  //JS FOR FORM SUBMISSION
var inputLat, inputLon, inputTscale, inputSeas, inputModes;
function downloadSubmit() {
  //get checked values
  inputLat = $("#latitude").val();
  inputLon = $('#longitude').val();
  inputTscale = $("#tscale").find(':selected')[0].value;
  inputSeas = $("#seas").find(':selected')[0].value;
  inputModes = $('.js-example-basic-multiple[name="mode_list[]"]').select2('data');
  
  if (inputTscale == null || inputSeas == null || inputModes == null 
    || inputModes.length == 0 || inputSeas.length == 0 || inputTscale.length == 0) {
    //missing filter(s)
    alert('Please select at least one option for each filter before hitting download.');
    $('.js-example-placeholder-single').val(null).trigger('change');
    $('.js-example-basic-multiple').val(null).trigger('change');
    return false;
  }
  else if (inputModes.length < 5) { //not enough modes
    alert('Please select a minimum of 5 modes of variability.');
    $('.js-example-placeholder-single').val(null).trigger('change');
    $('.js-example-basic-multiple').val(null).trigger('change');
    return false;
  }
  else if (inputLon < -180 || inputLon > 180) {
    alert('Longitude must be between ');
    $('.js-example-placeholder-single').val(null).trigger('change');
    $('.js-example-basic-multiple').val(null).trigger('change');
    $('form :input[type="number"]').val('');
    return false;
  }
  else {
    //first, get array of all season + time combos

    path = "/figures/customInput/site_dynamics_";
    path = path.concat(inputSeas + inputTscale);

    //now, need lat+lon of location for end of filepath

    //path = path.concat(inputLat + "_" + inputLon);
    path = path.concat(".png");
    
    //do some code stuff here
    /*
   //this for loop works, but for now we don't want downloads enabled   
    link = document.createElement("a");
    console.log(path);
    link.setAttribute("href", path);
    link.setAttribute("download", currentPath.split("/")[3]); //commenting this out should fix filenaming conventions (Download arg is the name it gives the file)
    link.click();
    */
    //reset form values after downloading figures for user
    $('.js-example-placeholder-single').val(null).trigger('change');
    $('.js-example-basic-multiple').val(null).trigger('change');
    return false;
  }
}