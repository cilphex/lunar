$(function() {
  var milliseconds_per_centiseconds = 10;
  var milliseconds_per_second = 1000;
  var milliseconds_per_minute = milliseconds_per_second * 60;
  var milliseconds_per_hour = milliseconds_per_minute * 60;
  var milliseconds_per_day = milliseconds_per_hour * 24;

  // var time_window = 30 * milliseconds_per_day;
  var time_window = 1 * milliseconds_per_day; // The ship will sit until 1 day beforehand
  // var time_window = 10 * milliseconds_per_minute;

  // var d1 = new Date();
  // d1.setFullYear(2016);   // 2016
  // d1.setMonth(6);        // May
  // d1.setDate(21);         // 8
  // d1.setHours(9);        // 6
  // d1.setMinutes(0);       // 0
  // d1.setSeconds(0);       // 0
  // d1.setMilliseconds(0);  // 0

  // 5/2/20: set to 1,000 days in the future
  var now = new Date()
  var d1 = new Date(now.getTime() + 10 * milliseconds_per_day);

  // d1.setFullYear(2016);   // 2016
  // d1.setMonth(3);        // May
  // d1.setDate(28);         // 8
  // d1.setHours(13);        // 6
  // d1.setMinutes(33);       // 0
  // d1.setSeconds(15);       // 0
  // d1.setMilliseconds(0);  // 0

  var pad = function(num, size) {
    num = num.toString();
    while (num.length < size)
      num = '0' + num;
    return num;
  }

  var countdown = function() {
    var d2 = new Date();
    var diff = Math.max(d1 - d2, 0);
    var days = Math.floor(diff / milliseconds_per_day);
    days = pad(days, 2);
    diff -= (days * milliseconds_per_day);
    var hours = Math.floor(diff / milliseconds_per_hour);
    hours = pad(hours, 2);
    diff -= (hours * milliseconds_per_hour);
    var minutes = Math.floor(diff / milliseconds_per_minute);
    minutes = pad(minutes, 2);
    diff -= (minutes * milliseconds_per_minute);
    var seconds = Math.floor(diff / milliseconds_per_second);
    seconds = pad(seconds, 2);
    diff -= (seconds * milliseconds_per_second);
    var centiseconds = Math.floor(diff / milliseconds_per_centiseconds);
    centiseconds = pad(centiseconds, 2);
    $('#days').html(days);
    $('#hours').html(hours);
    $('#minutes').html(minutes);
    $('#seconds').html(seconds);
    $('#centiseconds').html(centiseconds);
  }

  var moveRocket = function () {
    // return;
    var d2 = new Date();
    var diff = d1 - d2;
    var percent_remaining = diff / time_window * 100;
    if (percent_remaining > 100) {
      percent_remaining = 100;
    }
    else if (percent_remaining < 0) {
      percent_remaining = 0;
      land();
    }
    // console.log('percent_remaining', percent_remaining);
    $('.line, .rocket').css({top: percent_remaining + '%'});
  }

  var updateWarpfield = function() {
    var d2 = new Date();
    var diff = d1 - d2;
    var percent_remaining = diff / time_window * 100;
    var percent_complete = 100 - percent_remaining;
    var percent_complete = Math.max(percent_complete, 0);
    var velocity = Math.pow(percent_complete,4) / 100000000 / 3; // exponentially faster from 0.01 to 0.25
    velocity = Math.max(velocity, 0.01); // 0.01 min
    velocity = Math.min(velocity, 0.25); // 0.25 min
    Z = velocity;
    console.log('warpfield: percent_complete', percent_complete, 'Z', Z);
  }

  var land = function() {
    clearTimeout(moveRocket);
    $('.rocket').addClass('landed');
    $('.line').fadeOut();
    // setTimeout(function() {
    //   $('.reload').addClass('landed');
    // }, 3000);
    setTimeout(function() {
      $('.rocket').fadeOut();
    }, 4000);
    setTimeout(function() {
      $('.top-image').addClass('spin');
    }, 6000)
  }
  window.land = land;

  var fadeInMoon = function() {
    $('.moon').addClass('loaded');
  }
  var fadeInPath = function() {
    $('.flight').addClass('loaded');
  }
  var fadeInTimer = function() {
    $('#timer').addClass('loaded');
  }

  setInterval(countdown, 10);
  // countdown();
  setInterval(fadeInTimer, 100);
  setInterval(moveRocket, 1000);
  // moveRocket();
  setInterval(updateWarpfield, 2500);
  // updateWarpfield();

  // Fade in graphics once they've loaded
  var moon = new Image();
  moon.onload = fadeInMoon;
  moon.src = '/images/mars.png';
  var rocket = new Image();
  rocket.onload = function(){setTimeout(fadeInPath,500)};
  rocket.src = '/images/rocket1.png';

  var useAudioElement = true;
  var play = function() {
    if (useAudioElement) {
      var el = document.getElementById('themesong');
      el.currentTime = 0;
      el.play();
    }
    else {
      src = $('#audio_iframe').data('src');
      $('#audio_iframe').attr('src', src);
    }
    $('.music').addClass('playing');
  }
  var pause = function() {
    if (useAudioElement) {
      var el = document.getElementById('themesong');
      el.pause();
    }
    else {
      $('#audio_iframe').attr('src', '');
    }
    $('.music').removeClass('playing');
  }

  $('.music a').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    if ($('.music').hasClass('playing')) {
      pause();
    }
    else {
      play();
    }
  });

  // $('a.reload').click(function(e) {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if ($(this).hasClass('landed')) {
  //     location = location;
  //   }
  // });

  var preview = function() {
    time_window = 3 * milliseconds_per_minute;
    d1 = new Date();
    d1 = new Date(d1.getTime() + time_window);
    play();
  }
  window.preview = preview;

  // 5/2/2020: make it so that clicking the "days" number starts a preview
  $('.go').click(function(e) {
    preview();
  });

  // Start
  countdown();
  moveRocket();
  updateWarpfield();

  // 4/24/2020
  // Firebase stuff out of date, so just comment out / return before it
  return;

  // Viewer count stuff
  var listRef = new Firebase("https://tothemoonbase.firebaseio.com/presence/");
  var userRef = listRef.push();
  // Add ourselves to presence list when online.
  var presenceRef = new Firebase("https://tothemoonbase.firebaseio.com/.info/connected");
  presenceRef.on("value", function(snap) {
    if (snap.val()) {
      userRef.set(true);
      // Remove ourselves when we disconnect.
      userRef.onDisconnect().remove();
    }
  });
  // Number of online users is the number of objects in the presence list.
  listRef.on("value", function(snap) {
    var viewers = parseInt(snap.numChildren());
    var str = viewers == 1 ? 'viewer' : 'viewers';
    $('#viewer_count').html(viewers + ' ' + str);
  });
});
