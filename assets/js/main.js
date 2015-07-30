$(function() {
  queue()
    .defer(parseJSON, 'data/course_enroll_test.json')
    .defer(parseJSON, 'data/course_enroll_drop.json')
    .defer(parseJSON, 'data/course_enroll_notdrop.json')
    .defer(parseJSON, 'data/student_info_test.json')
    .defer(parseJSON, 'data/course_endtime.json')
    .await(initialize);

  var $courseSelector = $('#course-selector');
  var $studentSelector = $('input[name="student-type"]');
  var $selectorButton = $('#selector-button');

  function parseJSON(path, callback) {
    d3.json(path, function(json) {
      if (json) callback(null, json);
      else callback("Error parsing json files", null);
    });
  }

  function initialize(error, course_enroll, course_enroll_drop, course_enroll_notdrop, student_info, course_endtime) {
    if (error) {
      console.log(error);
      return;
    }

    var courseList = Object.keys(course_enroll);

    courseList.forEach(function(courseID) {
      $courseSelector.append('<option value="'+courseID+'">'+courseID+'</option>');
    });

    populateUI(course_enroll, course_enroll_drop, course_enroll_notdrop, student_info, course_endtime);

    $courseSelector.change(function() { populateUI(course_enroll, course_enroll_drop, course_enroll_notdrop, student_info, course_endtime); });
    $studentSelector.change(function() { populateUI(course_enroll, course_enroll_drop, course_enroll_notdrop, student_info, course_endtime); });
    $selectorButton.click(function() { populateUI(course_enroll, course_enroll_drop, course_enroll_notdrop, student_info, course_endtime); });
  }

  function populateUI(course_enroll, course_enroll_drop, course_enroll_notdrop, student_info, course_endtime) {
    var courseID = $courseSelector.val();
    var enrollIDs = course_enroll[courseID];
    var enrollDropIDs = course_enroll_drop[courseID];
    var enrollNotDropIDs = course_enroll_notdrop[courseID];
    var endTime = course_endtime[courseID];
    var studentType = parseInt($('input[name="student-type"]:checked').val(), 10);
    var student, studentID;

    switch(studentType) {
      case 0:
        studentID = enrollDropIDs[Math.floor(Math.random() * enrollDropIDs.length)];
        break;
      case 1:
        studentID = enrollNotDropIDs[Math.floor(Math.random() * enrollNotDropIDs.length)];
        break;
      case 2:
        studentID = enrollIDs[Math.floor(Math.random() * enrollIDs.length)];
        break;
    }

    student = student_info[""+studentID];

    populateFeaturePanel(student);
    populatePredictorPanel(student);
    drawChart(student, endTime);
  }

  function populateFeaturePanel(student) {
    $('#num-events').html(student.event.length);
    $('#num-sessions').html(student.NumberOfSessions);
    $('#avg-session').html(student.AverageSessionLength.toFixed(2));
    $('#num-events-per-session').html(student.EventsPerSession.toFixed(1));
    $('#time-in-course').html((student.timeDuration/3600).toFixed(2));
  }

  function populatePredictorPanel(student) {
    var dropRate = Number((student.yhat*100).toFixed(2));
    $('#drop-out-percentage').html(dropRate);
    if (student.y) {
      $('#actual-result').html("Drop");
      $('#actual-result').removeClass('pass');
      $('#actual-result').addClass('fail');
    } else {
      $('#actual-result').html("Not Drop");
      $('#actual-result').removeClass('fail');
      $('#actual-result').addClass('pass');
    }
    if (dropRate > 50) {
      $('.predictors').removeClass('pass');
      $('.predictors').addClass('fail');
    } else {
      $('.predictors').removeClass('fail');
      $('.predictors').addClass('pass');
    }
  }

  function drawChart(student, endTime) {
    var data = [];
    student.event.forEach(function(e, index) {
      data.push({ time: student.time[index], event: e, category: student.category[index] });
    });

    var $chartArea = $('.graphs .panel-content');

    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var width = $chartArea.width() - margin.left - margin.right;
    var height = 120 - margin.top - margin.bottom;

    var color = d3.scale.category10();

    var tooltip = d3.select('.graphs .panel-content').append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

    d3.select('svg').remove();

    var svg = d3.select('.graphs .panel-content').append('svg')
              .attr('width', $chartArea.width())
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Axis

    var xScale = d3.scale.linear().range([0, width]);
    var xAxis = d3.svg.axis().scale(xScale).orient('bottom');

    xScale.domain([0, endTime]);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append('text')
      .attr('class', 'label')
      .attr('x', width)
      .attr('y', -6)
      .style('text-anchor', 'end')
      .text('Time (minutes)');

    // Bars

    var bars = svg.selectAll('.bar').data(data);

    bars.exit().remove();

    bars.enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) { return xScale(d.time); })
      .attr('y', 30)
      .attr('width', 2)
      .attr('height', 30)
      .style('fill', function(d) { return color(d.event); })
      .on('mouseover', function(d) {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html('Time: ' + d.time.toFixed(2) + '<br />' + 'Category: ' + d.category + '<br />' + 'Event: ' + d.event)
          .style('left', (d3.event.pageX - 50) + 'px')
          .style('top', (d3.event.pageY - 60) + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }
});