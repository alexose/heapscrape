var sieve = require('sievejs')
  , qs = require('querystring');

one();

function one(){

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
        "email" : "alex@crimsonhexagon.com",
        "password" : "4kNzhwQsMNDEtRxh",
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
  var arr = JSON.parse(json),
    csvs = [];
  
  arr = [1];

  for (var i in arr){
    var report = arr[i];

    // Build form obj
    var form = {
      'query[over][start]':          '-604800000',
      'query[over][step]':           '86400000',
      'query[over][stop]':           '1425099600000',
      'query[over][offset]':         '300',
      'query[over][unique]':         true,
      'query[main][type]':           'agg',
      'query[main][fn]':             'count',
      'query[main][property][type]': 'object',
      'query[main][property][id]':   'symbol:75551',
      'query[main][format]':         'csv',
      'query[by][type]':             'field',
      'query[by][name]':             'target_text'
    }

    getCSV(form, check);
  }

  function check(csv){
    console.log(csv);
    csvs.push(csv);
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

  console.log(data);

  new sieve(data, { hooks : { onFinish : cb } });
}


