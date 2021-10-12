var getBoard = require('./user.findboard');
var getLists = require('./board.getlists');
var getCards = require('./list.getcards');
var getBoardMembers = require('./board.getmembers');
var getUserByID = require('./user.getbyid');
var getBoardCustomFields = require('./board.getCustomFields');
const prompt = require('prompt');
let promptCB = require('prompt-checkbox');
const emailCreator = require('./email.creator');


let members = [];
let listCardInfo = {};
let boardCustomFields = [];
//start the prompt to ask for the username / password
prompt.start();
//setup schema for what to ask for
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
//get input and begin trello integration code
prompt.get(schema, function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Board Name: ' + result.boardname);
    beginTrelloIntegration(result.username, result.boardname);

});
//on error function
function onErr(err) {
    console.log(err);
}
//function to start getting board info
function beginTrelloIntegration(username, boardname) {
    //get information about board
    cacheBoardInfo(username, boardname).then(boardid => {
        //get lists from the board
        getLists(boardid).then(lists => {
            //with this list of information, ask the user what list they want to get information from
            promptUserForLists(lists);
        });
    }).catch(onErr);
}
//prompt user to find out what lists to get info from
function promptUserForLists(lists) {
    //loop through all lists and cache names
    let listNames = [];
    lists.forEach(list => {
        listNames.push(list.name);
    });
    //ask the user what lists they want to get cards from
    let listPrompt = new promptCB({
        name: 'lists',
        message: 'What lists do you want to gather data from?',
        choices: listNames
    });
    //run the list prompt
    listPrompt.run()
        .then(function (answers) {
            //filtered list of all lists based on answers passed in
            var selectedLists = lists.filter(list => { return answers.indexOf(list.name) >= 0 });
            // get cards for each list. create a promise for getting list of cards, then run
            //Promise.all to wait until all cards are gathered from all lists
            var getCardsPromiseArray = [];
            selectedLists.forEach(list => {
                let promise = new Promise((resolve, reject) => {
                    //get cards from trello
                    getCards(list.id).then(cards => {
                        //add to card Info object and resolve the main process
                        listCardInfo[list.name] = cards;
                        resolve();
                    }).catch(reject);
                });
                //push the promise onto the all promise array
                getCardsPromiseArray.push(promise);
            });
            //once all the promises are done, get all the information on the cards and compile the email
            Promise.all(getCardsPromiseArray).then(values => {
                //construct email here
                emailCreator(listCardInfo, members, boardCustomFields).then(() => {
                    console.log('Email has been created!');
                });

            });
        })
        .catch(onErr);
}
//get all information about the board that you need
function cacheBoardInfo(username, boardname) {
    let promise = new Promise((resolve, reject) => {
        //get the board based on the board name and username
        getBoard(username, boardname).then(boardid => {
            //cache custom fields for the board
            getBoardCustomFields(boardid).then(customFields => {
                boardCustomFields = customFields;
                //get all members of the board and cache that
                getBoardMembers(boardid).then(_members => {
                    var promiseArray = [];
                    //get all information for the members
                    _members.forEach(member => {
                        promiseArray.push(getUserByID(member.idMember));
                    });
                    Promise.all(promiseArray).then(users => {
                        members = users;
                        // console.log(members);
                        resolve(boardid);
                    });

                });
            })
        }).catch(err => {
            onErr(err);
            reject(err);
        });
    });
    return promise;
}