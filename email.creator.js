let formatCard = require('./email.formatcard');
const fs = require('fs');
module.exports = function (listCardInfo, members, boardCustomFields) {
  //create a promise to create entire email 
  var promise = new Promise((resolve, reject) => {
    //get all keys from the lists
    var lists = Object.keys(listCardInfo);
    let email = '';
    var lPromises = [];
    //loop thru all the lists
    lists.forEach(list => {
      //create a promise for each list eleement
      var listPromise = new Promise((lResolve, lReject) => {
        if (listCardInfo[list].length > 0) {

          //get all promises for formatting the cards
          var cardPromises = [];
          listCardInfo[list].forEach(card => {
            cardPromises.push(formatCard(card, members, boardCustomFields));
          });
          //once all the cards are formatted, then add to the email object
          Promise.all(cardPromises).then(cards => {
            //add the name of the list to the main email string
            email += '<b>' + list + '</b>\r\n\r\n';
            cards.forEach(_card => {
              email += _card;
              email += '\r\n\r\n';
              //resolve the list promise
              lResolve();
            });

          });
        }
        else {
          lResolve();
        }
      });
      lPromises.push(listPromise);

    });
    //once all the list promises are complete, write the file
    Promise.all(lPromises).then(() => {
      var now = new Date();
      fs.writeFile((now.getMonth() + 1).toString() + now.getDate().toString() + + now.getFullYear().toString() + 'email.txt', email, () => {
        resolve(email);
      });
    });

  });
  return promise;
};