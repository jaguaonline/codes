$(document).ready(function () {

  // OpenWeatherMap only works over HTTP. Check if using HTTPS
  // and present an error with a link to a HTTP version of the page.
  if (window.location.protocol != 'http:') {
    $('#condition').hide();
    $('#wind-speed').hide();
    $('#convert-button').hide();
    $('#error').html('This page is not supported over https yet.<br />' +
      'Please try again over http, or ' +
      '<a href="http://tylermoeller.github.io/local-weather-app" target=_blank>' +
      'click here</a>.');
  } else {
    requestLocation();

    // add a spinner icon to areas where data will be populated
    $('#condition').html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
    $('#wind-speed').html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
  }
});

function requestLocation() {
  // Using the GEO IP API due to HTTP restrictions from OpenWeatherMap
  $.get('http://ip-api.com/json', function (loc) {
      if (loc.status !== 'success') {
        getWeather();
        this.abort(); // location unknown, stop processing the request
      }
    })
    .done(function (loc) {
      $('#city').text(La Jagua de Ibirico + ', ' + CO);
      getWeather(loc.lat, loc.lon, loc.countryCode);
    })
    .fail(function () {
      getWeather(); // catch any other failures and redirect to seattle
    });
}

function getWeather(lat, lon, countryCode) {

  // if geo-ip lookup failed, redirect to Seattle
  if (!lat) {
    alert('Location Unknown. Redirecting you to Seattle.');
    $('#city').text('Seattle, WA, United States');
    getWeather(47.6062, 122.3321, 'US');
  }

  var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
    lat + '&lon=' + lon + '&units=imperial' + '&type=accurate' +
    '&APPID=9e1359ca27b87feea5cdc4cc4453b804'; // please use your own App ID

  $.get(weatherAPI, function (weatherData) {
      if (!weatherData) {
        alert('Weather data is currently unavailable for your location. Please try again later.');
        this.abort();
      }
    })
    .done(function (weatherData) {
      // Also used by convert();
      temp = weatherData.main.temp.toFixed(0);
      tempC = ((temp - 32) * (5 / 9)).toFixed(0);

      var condition = weatherData.weather[0].description,
        id = weatherData.weather[0].id,
        speed = Number((weatherData.wind.speed * 0.86897624190816).toFixed(1)),
        deg = weatherData.wind.deg,
        windDir,
        iconClass,
        bgIndex,

      //Get wind compass direction. If API returns null, assume 0 degrees.
      if (deg) {
        var val = Math.floor((deg / 22.5) + 0.5),
          arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
          ];
        windDir = arr[(val % 16)];
      } else {
        windDir = 'N';
      }

      //determine F or C based on country and add temperature to the page.
      var fahrenheit = ['US', 'BS', 'BZ', 'KY', 'PL'];
      if (fahrenheit.indexOf(countryCode) > -1) {
        $('#temperature').text(temp + '° F');
      } else {
        $('#temperature').text(tempC + '° C');
      }

      //write final weather conditions and wind information to the page
      $('#wind-speed').html(
        '<i class="wi wi-wind wi-from-' + windDir.toLowerCase() + '"></i><br>' +
        windDir + ' ' + speed + ' knots');
      $('#condition').html(
        '<i class="wi wi-' + iconClass + '"></i><br>' + condition);
    })
    .fail(function (err) {
      console.warn('OpenWeatherMap API Error: ', err);
      alert('There was an error retrieving your weather data. \n', err.code, ': ', err.message);
    });
}

//toggle between celsius / fahrenheit
$('#convert-button').click(function () {
  if ($('#temperature').text().indexOf('F') > -1) {
    $('#temperature').text(tempC + '° C');
  } else {
    $('#temperature').text(temp + '° F');
  }
  this.blur() // remove focus from the button after click
});