var sieve = require('sievejs')
  , qs = require('querystring');

var options = {
  hooks : { onFinish: one },
  verbose : true
};

var data = JSON.stringify({
    "url": "https://heapanalytics.com/login",
    "selector": { "csrf" : "$(input[name='_csrf']).val()" },
    "engine": "jquery",
    "debug": true,
    "useHeaders" : true,
    "then": {
        "url": "https://heapanalytics.com/login",
        "method": "POST",
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

  var data = results[0].entry.then.data
    , cookie = data['set-cookie'][0];

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

  decoded['heap.sid'] = sid.replace(json, JSON.stringify(obj));

  cookie = qs.stringify(decoded);


  console.log('Generated cookie.  Getting reports JSON...');

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


