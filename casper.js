var casper = require('casper').create();

casper.start('https://heapanalytics.com/login', function() {
	this.page.render('what.png'); 
});

casper.run();
