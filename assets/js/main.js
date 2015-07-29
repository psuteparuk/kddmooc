$(function() {
  queue()
    .defer(parseJSON, 'data/course_enroll_test.json')
    .defer(parseJSON, 'data/student_info_test.json')
    .defer(parseJSON, 'data/course_endtime.json')
    .await(initialize);

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
      $('#course-selector').append('<option value="'+courseID+'">'+courseID+'</option>');
    });
  }
});