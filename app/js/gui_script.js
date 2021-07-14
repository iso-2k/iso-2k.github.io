$(document).ready(function() { //initialize select2 on dropdown
    $('.js-example-placeholder-single').select2({
      placeholder: "Proxy Location",
      allowClear: true
    });
    $('.js-example-placeholder-single[name="timescales[]"]').select2({
      placeholder: "Timescale",
      allowClear: false
    });
    $('.js-example-placeholder-single[name="seasonality[]"]').select2({
      placeholder: "Seasonality",
      allowClear: false
    });
    $('.js-example-placeholder-basic-multiple[name="mode_list[]"]').select2({
        placeholder: "Modes of Variability",
        allowClear: false
        /*maximumSelectionLength: 20*/
      });
  });