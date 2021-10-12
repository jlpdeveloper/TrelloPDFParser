let formatCard = require('./email.formatcard');
const fs = require('fs');
module.exports = function (listCardInfo, members, boardCustomFields) {
  var promise = new Promise((resolve, reject) => {
    var lists = Object.keys(listCardInfo);
    email = '';
    lists.forEach(list => {
      var listPromise = new Promise((lResolve, lReject) => {
        email += '<b>' + list + '</b>\r\n\r\n';
        var cardPromises = [];
        listCardInfo[list].forEach(card => {
          cardPromises.push(formatCard(card, members, boardCustomFields));
        });
        Promise.all(cardPromises).then(cards => {
          cards.forEach(_card => {
            email += _card;
          });
          lResolve();
        });
      });
      Promise.all(listPromise).then(() => {
        var now = new Date();

        fs.writeFile((now.getMonth() + 1) + now.getDate() + + now.getFullYear() +  'email.txt', email).then(() => {
          resolve(email);
        });
      });
    });

  });
  return promise;
};