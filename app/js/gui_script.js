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

$('#latitude').blur(function() {
  this.value = parseFloat(this.value).toFixed(4);
});


function setDecimal(event) {
  this.value = parseFloat(this.value).toFixed(4);
}
  
  //JS FOR FORM SUBMISSION
var inputLat, inputLon, inputTscale, inputSeas, inputModes;
function downloadSubmit() {
  //get checked values
  inputLat = $("#latitude").val();
  inputLon = $('#longitude').val();
  inputTscale = $("#tscale").find(':selected')[0].value;
  inputSeas = $("#seas").find(':selected')[0].value;
  inputModes = $('.js-example-basic-multiple[name="mode_list[]"]').select2('data');
  
  if (inputModes.length < 5) { //not enough modes
    alert('Please select at least 5 modes of variability.');
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
    path = "/figures/customInput/site_dynamics_";
    path = path.concat(inputSeas + inputTscale);

    //now, need lat+lon of location for end of filepath

    //path = path.concat(inputLat + "_" + inputLon);
    path = path.concat(".png");
    console.log(path)
    
    //do some code GUI stuff here to create fig
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

//prevent mouse scrolling from changing number input
$('form').on('focus', 'input[type=number]', function (e) {
  $(this).on('wheel.disableScroll', function (e) {
    e.preventDefault()
  })
})
$('form').on('blur', 'input[type=number]', function (e) {
  $(this).off('wheel.disableScroll')
})