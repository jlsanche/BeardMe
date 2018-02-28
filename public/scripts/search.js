$('#beard-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/beardss?' + search, function(data) {
    $('#beard-grid').html('');
    data.forEach(function(beard) {
      $('#beard-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="thumbnail">
            <img src="${ beard.image }">
            <div class="caption">
              <h4>${ beard.name }</h4>
            </div>
            <p>
              <a href="/beards/${ beard._id }" class="btn btn-primary">More Info</a>
            </p>
          </div>
        </div>
      `);
    });
  });
});

$('#beard-search').submit(function(event) {
  event.preventDefault();
});