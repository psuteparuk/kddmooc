$(function() {
  queue()
    .defer(parseJSON, 'data/course_enroll_test.json')
    .defer(parseJSON, 'data/student_info_test.json')
    .defer(parseJSON, 'data/course_endtime.json')
    .await(initialize);

  var $courseSelector = $('#course-selector');
  var $studentSelector = $('input[name="student-type"]');

  function parseJSON(path, callback) {
    d3.json(path, function(json) {
      if (json) callback(null, json);
      else callback("Error parsing json files", null);
    });
  }

  function initialize(error, course_enroll, student_info, course_endtime) {
    if (error) {
      console.log(error);
      return;
    }

    var courseList = Object.keys(course_enroll);

    courseList.forEach(function(courseID) {
      $courseSelector.append('<option value="'+courseID+'">'+courseID+'</option>');
    });

    populateUI(course_enroll, student_info, course_endtime);

    $courseSelector.change(function() { populateUI(course_enroll, student_info, course_endtime); });
    $studentSelector.change(function() { populateUI(course_enroll, student_info, course_endtime); });
  }

  function populateUI(course_enroll, student_info, course_endtime) {
    var courseID = $courseSelector.val();
    var enrollIDs = course_enroll[courseID];
    var studentType = parseInt($('input[name="student-type"]:checked').val(), 10);
    var student, studentID;

    switch(studentType) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        studentID = enrollIDs[Math.floor(Math.random() * enrollIDs.length)];
        student = student_info[""+studentID];
        break;
    }

    populateFeaturePanel(student);
    populatePredictorPanel(student);
  }

  function populateFeaturePanel(student) {
    $('#num-events').html(student.event.length);
    $('#num-sessions').html(student.NumberOfSessions);
    $('#avg-session').html(student.AverageSessionLength);
    $('#num-events-per-session').html(student.EventsPerSession);
  }

  function populatePredictorPanel(student) {
    var dropRate = Number((student.yhat*100).toFixed(2));
    $('#drop-out-percentage').html(dropRate);
    if (dropRate > 50) {
      $('.predictors').removeClass('pass');
      $('.predictors').addClass('fail');
    } else {
      $('.predictors').removeClass('fail');
      $('.predictors').addClass('pass');
    }
  }
});