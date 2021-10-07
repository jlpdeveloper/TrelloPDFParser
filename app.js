var getBoard = require('./user.findboard');


getBoard().then(d => console.log(d)).catch(err => console.log(err));