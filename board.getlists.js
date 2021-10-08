let config = require('./config.json');

// This code sample uses the 'node-fetch' library:
// https://www.npmjs.com/package/node-fetch
const fetch = require('node-fetch');

module.exports = function (boardid) {
    let promise = new Promise((resolve, reject) => {
    let apiurl = 'https://api.trello.com/1/boards/' + boardid+ '/lists?' +
        'token=' + config.apitoken + '&key=' + config.apikey;
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
        // .then(text =>{
        //     console.log(text);
        //     resolve('');
        // })
        .then(json => {
           if(json.length > 0){
               resolve(json);
           }
           else{
               reject('This board has no lists!');
           }
        })
        .catch(err => {
            console.error(err);
            reject('');
        });
    });
    return promise;
};