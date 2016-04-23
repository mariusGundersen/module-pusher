var app = require('./bin/app.js');

app().catch(e => console.error(e && e.stack));