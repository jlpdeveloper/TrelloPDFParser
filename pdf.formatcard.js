let getCustomFields = require('./card.getcustomfields');
/* Creates an array of pdf paragraphs for pdfmake.js docuemnt definition
 * Parameters:
 * card: the card object returned from trello
 * members: all members of the board
 * boardCustomFields: the custom field elements of the board
 * cardPosition: a counter for an ordered list for the cards
 * Returns: a promise. Promise returns an array of objects
*/
module.exports = function (card, members, boardCustomFields, cardPosition) {
    let promise = new Promise((resolve, reject) => {
        try {
            //get all custom field elements for the card
            getCustomFields(card.id).then(cardCustomFieldInfo => {
                //create an array to hold pdf elements
                let cardInfo = [];
                //push the numeric position of the card and the name as a subheader
                cardInfo.push({
                    text: cardPosition + '. ' + card.name,
                    style: 'subheader'
                });
                //create an empty stackedText array
                let stackedText = [];
                //create an array for members
                let memberArray = [];
                //loop through all members of the board
                members.forEach(member => {
                    //if the member is on the card, get the member name
                    if (card.idMembers.indexOf(member.id) >= 0) {
                        //get the full name, if it contains a ".", split and rejoin on space
                        let fn = member.fullName;
                        if(fn.indexOf('.')>= 0){
                            let nameArray = fn.split('.');
                            fn = '';
                            nameArray.forEach(element => {
                                //uppercase the first character of the name
                                fn += element[0].toUpperCase() + element.substr(1) + ' ';
                            });
                        }
                        //add the member to the array
                        memberArray.push(fn);
                    }
                });
                //if we have members, add an item that says who's on the project
                if(memberArray.length > 0){
                    stackedText.push('Project Members: ' + memberArray.join(','));
                }
                else{
                    //else mark unassigned
                    stackedText.push('Project Members: Not Assigned');
                }
                //check to see if the status field exists on the board
                var statusField = boardCustomFields.find(field => {
                    return field.name == 'Status';
                });
                //check to see if the QA Release Date exists on the card
                var estimatedQADate = boardCustomFields.find(field => {
                    return field.name == 'QA Release Date';
                });
                
                //if status field exists, then get the info about it
                if(statusField){
                    //check to see if the status field has been set for the card
                    var status  = cardCustomFieldInfo.find(info => {
                        return info.idCustomField == statusField.id;
                    });
                    //if it has, find the value for its option
                    if(status){
                        var optionText = statusField.options.find(o => {
                            return o.id == status.idValue;
                        });
                        //if we found the option, push to the stack array the option text
                        if(optionText){
                            stackedText.push('Project Status: ' + optionText.value.text);
                        }
                        
                    }
                    else{
                        //else set to N/A
                        stackedText.push('Project Status: N/A');
                    }

                }
                else{
                    //else set to N/A
                    stackedText.push('Project Status: N/A');
                }
                //if the estimatedQADate field was found, lets try to get its value
                if(estimatedQADate){
                    //find the field on the card
                    var qaDate = cardCustomFieldInfo.find(info => {
                        return info.idCustomField == estimatedQADate.id;
                    });
                    //if that field exists, let's get the info from it
                    if(qaDate){
                        var qDateObj = new Date(qaDate.value.date);
                        var dString = (qDateObj.getMonth() + 1).toString() + '/' + qDateObj.getDate().toString() + '/' + qDateObj.getFullYear().toString()
                        stackedText.push('Estimated Date for QA Release: ' + dString);
                    }
                }
                //if we have stacked text, lets push to the cardInfo array
                if(stackedText.length > 0){
                    cardInfo.push({
                        stack: stackedText,
                        style:'listElement'
                    });
                }
                //resolve the promise
                resolve(cardInfo);

            });
        } catch (error) {
            reject(error);
        }
    });
    //return the promise that we'll return a card array format eventually
    return promise;
};