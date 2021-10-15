let getCustomFields = require('./card.getcustomfields');

module.exports = function (card, members, boardCustomFields) {
    let promise = new Promise((resolve, reject) => {
        try {
            getCustomFields(card.id).then(cardCustomFieldInfo => {
                let cardInfo = '';
                cardInfo += '- ' +  card.name + '\r\n     Project Members: ';
                var memberArray = [];
                members.forEach(member => {
                    if (card.idMembers.indexOf(member.id) >= 0) {
                        var fn = member.fullName;
                        if(fn.indexOf('.')>= 0){
                            var nameArray = fn.split('.');
                            fn = '';
                            nameArray.forEach(element => {
                                fn += element[0].toUpperCase() + element.substr(1) + ' ';
                            });
                        }
                        memberArray.push(fn);
                    }
                });
                if(memberArray.length > 0){
                    cardInfo += memberArray.join(',');
                }
                else{
                    cardInfo += 'Not Assigned';
                }
                
                var statusField = boardCustomFields.find(field => {
                    return field.name == 'Status';
                });
                var estimatedQADate = boardCustomFields.find(field => {
                    return field.name == 'QA Release Date';
                });
                cardInfo+='\r\n     Project Status: ';
                //if status field exists, then get the info about it
                if(statusField){
                    var status  = cardCustomFieldInfo.find(info => {
                        return info.idCustomField == statusField.id;
                    });
                    if(status){
                        var optionText = statusField.options.find(o => {
                            return o.id == status.idValue;
                        })
                        if(optionText){
                            cardInfo += optionText.value.text + '\r\n';
                        }
                        
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
                        var qDateObj = new Date(qaDate.value.date);
                        var dString = (qDateObj.getMonth() + 1).toString() + '/' + qDateObj.getDate().toString() + '/' + qDateObj.getFullYear().toString()
                        cardInfo += '     Estimated Date for QA Release: ' + dString  + '\r\n';
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