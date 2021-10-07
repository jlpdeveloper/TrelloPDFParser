let config = require('./config.json');

// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch');

module.exports = function () {
    let promise = new Promise((resolve, reject) => {
    let apiurl = 'https://api.trello.com/1/members/' + config.username + '/boards?' +
        'token=' + config.apitoken + '&key=' + config.apikey + '&name=' + config.boardname;
    fetch(apiurl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            console.log(
                `Response: ${response.status} ${response.statusText}`
            );
            //console.log(response.json());
            return response.json();
            
        })
        .then(json => {
            var filteredBoards = json.filter(d => { return d.name == config.boardname});
            console.log(filteredBoards);
            if(filteredBoards.length > 0){
                resolve(filteredBoards[0].id);
            }
            else{
                reject('');
            }
        })
        .catch(err => {
            console.error(err);
            reject('');
        });
    });
    return promise;
};