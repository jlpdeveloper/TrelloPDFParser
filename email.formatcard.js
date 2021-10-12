let getCustomFields = require('./card.getcustomfields');

module.exports = function (card, members, boardCustomFields) {
    let promise = new Promise((resolve, reject) => {
        try {
            getCustomFields(card.id).then(cardCustomFieldInfo => {
                let cardInfo = '';
                cardInfo += '<b>' + card.name + '</b>\r\nProject Members: ';
                var memberArray = [];
                members.forEach(member => {
                    if (card.idMembers.indexOf(member.id) >= 0) {
                        memberArray.push(member.fullName);
                    }
                });
                cardInfo += memberArray.join(',') + '\r\nStatus:';
                var statusField = boardCustomFields.find(field => {
                    return field.display.name == 'Project Status';
                });
                var estimatedQADate = boardCustomFields.find(field => {
                    return field.display.name == 'Tenative QA Date';
                });
                cardInfo+='\r\nProject Status: ';
                //if status field exists, then get the info about it
                if(statusField){
                    var status  = cardCustomFieldInfo.find(info => {
                        return info.idCustomField == statusField.id;
                    });
                    if(status){
                        cardInfo += status.value + '\r\n';
                    }
                    else{
                        cardInfo += 'N/A\r\n';
                    }

                }
                else{
                    cardInfo += 'N/A\r\n';
                }
                if(estimatedQADate){
                    var qaDate = cardCustomFieldInfo.find(info => {
                        return info.idCustomField == estimatedQADate.id;
                    });
                    if(qaDate){
                        cardInfo += 'Estimated Date for QA Release: ' + qaDate.value  + '\r\n';
                    }
                }
                resolve(cardInfo);

            });
        } catch (error) {
            reject(error);
        }

    });
    return promise;
};