var sieve = require('sievejs')
  , qs = require('querystring');

var options = {
  hooks : { onFinish: one }
};

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

new sieve(data, options);

function one(results){

  var cookie = results[0].result[0].cookie;

  var data = JSON.stringify({
    "url" : "https://heapanalytics.com/api/report",
    "redirect": false,
    "headers" : {
        "Cookie" : cookie
    }
  })

  options = {
    hooks : { onFinish: two },
    verbose : true
  }

  new sieve(data, options);
}

function two(json){
	var obj = JSON.parse(json);
	console.log(obj);
}

function getCSV(id, cb){
	
}


