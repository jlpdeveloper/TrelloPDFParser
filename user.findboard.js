let config = require('./config.json');

// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch');

module.exports = function (username, boardname) {
    let promise = new Promise((resolve, reject) => {
    let apiurl = 'https://api.trello.com/1/members/' + username + '/boards?' +
        'token=' + config.apitoken + '&key=' + config.apikey;
    fetch(apiurl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
           
            //console.log(response.json());
            return response.json();
            
        })
        .then(json => {
            var filteredBoards = json.filter(d => { return d.name == boardname});
            if(filteredBoards.length > 0){
                resolve(filteredBoards[0].id);
            }
            else{
                reject('Board was not found. Makesure your username and board name are correct!');
            }
        })
        .catch(err => {
            console.error(err);
            reject('');
        });
    });
    return promise;
};