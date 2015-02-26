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

  var cookie = results[0].cookie[0];

  console.log(cookie);

  // The heap token requires some URLencoded stuff to be jammed into it:
  var decoded = qs.decode(cookie)
    , sid = decoded['heap.sid'];

  // Find the curly brackets
  var begin = sid.indexOf('{')
    , end = sid.indexOf('}') - 3
    , json = sid.substr(begin, end)
    , obj = JSON.parse(json);

  // Add params
  obj.email = 'alex@crimsonhexagon.com';
  obj.app_id = '1822452561';
  obj.env_id = '1822452561';
  obj.proj_id = '1822452561';
  obj.write_perm = true; 

  var result = sid.replace(json, JSON.stringify(obj));

  // URLEncode everything up to token
  var arr = result.split(';')
    , encoded = qs.escape(arr.shift()) + ';';

  cookie = 'heap.sid=' + encoded;
  
  console.log('Generated cookie.  Getting reports JSON...');

  console.log(cookie);
  
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

function two(results){
  console.log(results);
}


