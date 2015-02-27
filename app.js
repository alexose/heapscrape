var sieve    = require('sievejs'),
  qs         = require('querystring'),
  parser     = require('fast-csv'),
  handlebars = require('handlebars'),
  nodemailer = require('nodemailer'),
  log        = require('npmlog')
  options    = require('./config.js');

one();

function one(){

  log.info('Getting cookie...');

  var data = JSON.stringify({
    "url": "https://heapanalytics.com/login",
    "selector": { "csrf" : "$(input[name='_csrf']).val()" },
    "engine": "jquery",
    "debug": true,
    "useHeaders" : true,
    "verbose" : true,
    "then": {
      "url": "https://heapanalytics.com/login",
      "method": "POST",
      "useHeaders" : true,
      "redirect" : false,
      "debug" : true,
      "form": {
        "email" : options.heap.email, 
        "password" : options.heap.pass, 
        "_csrf" : "{{csrf}}"
      },
      "headers" : {
        "Content-Type" : "application/x-www-form-urlencoded"
      }
    }
  });

  new sieve(data, { hooks : { onFinish : two } });
}

var cookie, csrf;
function two(results){
  
  log.info('Getting reports...');

  cookie = results[0].result[0].cookie[0],
    csrf = results[0].entry.then.data.csrf[0];

  var data = JSON.stringify({
    "url" : "https://heapanalytics.com/api/report",
    "redirect": false,
    "headers" : {
      "Cookie" : cookie
    }
  });

  new sieve(data, { hooks : { onFinish : three } });
}

function three (json){
  
  log.info('Getting CSVs...');
  
  var arr = JSON.parse(json),
    csvs = [],
    expected = 0;
  
  for (var i in arr){
    var report = arr[i],
      query = report.query;

    if (report.name.toLowerCase().indexOf('product') === 0){
      
      expected++;

      // Build form obj
      var form = {
        'query[over][start]':          query.over.start, 
        'query[over][step]':           query.over.step,
        'query[over][stop]':           query.over.stop,
        'query[over][offset]':         query.over.offset,
        'query[over][unique]':         query.over.unique,
        'query[main][type]':           query.main.type,
        'query[main][fn]':             query.main.fn, 
        'query[main][property][type]': query.main.property.type,
        'query[main][property][id]':   query.main.property.id,
        'query[main][format]':         'csv',
        'query[by][type]':             query.by.type, 
        'query[by][name]':             query.by.name
      }

      getCSV(form, check);
    }
  }

  function check(json){
    var obj = JSON.parse(json[0]);
    csvs.push(obj.csv);
    if (csvs.length === expected){
      four(csvs);
    }
  }
}

function getCSV(form, cb){
  var data = JSON.stringify({
    "url" : "https://heapanalytics.com/api/csv",
    "method" : "POST",
    "form": form,
    "headers" : {
      "Cookie" : cookie,
      "X-CSRF-Token" : csrf,
      "X-Requested-With" : "XMLHttpRequest"
    }
  });

  new sieve(data, { hooks : { onFinish : cb } });
}

// Process csvs
function four(csvs){

  log.info('Processing CSVs...');

  var reports = [];

  for (var i in csvs){
    var csv = csvs[i],
      rows = [],
      rarr = csv.split('\n');

    // Only look at first 30 rows
    for (var c=0; c<30; c++){
      var cols = [],
        arr = rarr[c].split(',');

      // Push title
      cols.push(arr.shift())

      // TODO: sum everything else?
      cols = cols.concat(arr);

      rows.push({ cols : cols });
    }
  
    reports.push({ rows : rows });
  }

  five(reports);
}

var source = ''
    + '{{#reports}}'
    + '<table>'
    +   '{{#rows}}'
    +   '{{#if @first}}'
    +   '<thead>'
    +     '{{#cols}}'
    +     '<th>{{.}}</th>'
    +     '{{/cols}}'
    +   '</thead>'
    +   '{{else}}'
    +   '<tr>'
    +     '{{#cols}}'
    +     '<td style="min-width: 60px">{{.}}</td>'
    +     '{{/cols}}'
    +   '</tr>'
    +   '{{/if}}'
    +   '{{/rows}}'
    + '</table>'
    + '{{/reports}}';

function five(reports){
  
  log.info("Sending CSVs...");

  // Configure mail services
  var transport = nodemailer.createTransport({
    service: "SES",
      auth: {
        user: options.aws.user,
        pass: options.aws.pass 
      }
  });

  var mailOptions = {
    from : options.aws.from,
    to : options.aws.to,
    subject : 'User metrics for the week of ' + getDate()
  };

  var template = handlebars.compile(source)
    , html = template({ reports : reports });

  mailOptions.html = html;

  transport.sendMail(mailOptions, function(error, response){
    if (error){
      log.error(error);
    } else {
      log.info("CSVs Sent!");
    }

    transport.close();
  });
}

// via http://stackoverflow.com/questions/1531093
function getDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd='0'+dd
  } 

  if(mm<10) {
      mm='0'+mm
  } 

  today = mm+'/'+dd+'/'+yyyy;
  return today; 
}
