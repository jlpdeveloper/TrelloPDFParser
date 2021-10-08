var getBoard = require('./user.findboard');
var getLists = require('./board.getlists');
var getCards = require('./list.getcards');
var getBoardMembers = require('./board.getmembers');
var getUserByID = require('./user.getbyid');
const prompt = require('prompt');
let promptCB = require('prompt-checkbox');
const { userInfo } = require('os');

let members = [];
var listCardInfo = {};

prompt.start();
var schema = {
    properties: {
        username: {
            description: 'What is your username?',
            type: 'string'
        },
        boardname: {
            description: 'What is the name of the board you want info from?',
            type: 'string'
        }

    }
}
prompt.get(schema, function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Board Name: ' + result.boardname);
    beginTrelloIntegration(result.username, result.boardname);

});

function onErr(err) {
    console.log(err);

}

function beginTrelloIntegration(username, boardname) {
    cacheBoardInfo(username, boardname).then(boardid => {
        getLists(boardid).then(lists => {
            promptUserForLists(lists);
        });
    }).catch(onErr);
}
function promptUserForLists(lists) {
    // console.log(lists);
    let listNames = [];
    lists.forEach(list => {
        listNames.push(list.name);
    });
    let listPrompt = new promptCB({
        name: 'lists',
        message: 'What lists do you want to gather data from?',
        choices: listNames
    });
    listPrompt.run()
        .then(function (answers) {
            // console.log(answers);
            var selectedLists = lists.filter(list => { return answers.indexOf(list.name) >= 0 });
            var getCardsPromiseArray = [];
            selectedLists.forEach(list => {
                let promise = new Promise((resolve, reject) => {
                    getCards(list.id).then(cards => {
                        listCardInfo[list.name] = cards;
                        resolve();
                    }).catch(reject);
                });
                getCardsPromiseArray.push(promise);
            });
            Promise.all(getCardsPromiseArray).then(values =>{
                //construct email here
                console.log(listCardInfo);
            });
        })
        .catch(onErr);
}

function cacheBoardInfo(username, boardname) {
    let promise = new Promise((resolve, reject) => {
        getBoard(username, boardname).then(boardid => {
            getBoardMembers(boardid).then(_members => {
                var promiseArray = [];
                _members.forEach(member => {
                    promiseArray.push(getUserByID(member.idMember));
                });
                Promise.all(promiseArray).then(users => {
                    members = users;
                    // console.log(members);
                    resolve(boardid);
                });

            });
        }).catch(err => {
            onErr(err);
            reject(err);
        });
    });
    return promise;
}