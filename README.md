Heapscrape
----------

Scrape Heap Analytics reports and email results somewhere.

Installation
------------

    git clone git@github.com:alexose/heapscrape.git
    cd heapscrape
    npm install

Configuration
-------------

    cp config.js.sample config.js
    nano config.js

Proceed to fill in your credentials.

Usage
-----

    node ./app.js user@example.com [prefix]

Prefix is an optional argument that will only target reports beginning with that string, i.e., "Product-" or "Research-"
