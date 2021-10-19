let formatCard = require('./pdf.formatcard');
const fs = require('fs');
//setup fonts required for pdfmake.js
const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  },
};
//create pdf printer
var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
/* Create the PDF for the lists sent in
 * Parameters:
 * listCardInfo: an object who's keys are the names of all the lists
 * members: all members of the board
 * boardCustomFields: all the custom fields on the board
 * sortedListsNames: the list names in the order the user wants them in on the pdf
 * Returns: A promise. Promise returns file name of the pdf
*/
module.exports = function (listCardInfo, members, boardCustomFields, sortedListsNames) {
  //create a promise to create entire email 
  var promise = new Promise((resolve, reject) => {
    //get all keys from the lists
    let lists = Object.keys(listCardInfo);
    //create an object to store all the arrays of card pdf paragraphs
    let listCardContent = {};
    //create an array of promises for when the all the card promises are done
    let lPromises = [];
    //loop thru all the lists
    lists.forEach(list => {
      //create a promise for each list eleement
      let listPromise = new Promise((lResolve, lReject) => {
        if (listCardInfo[list].length > 0) {
          //get all promises for formatting the cards
          let cardPromises = [];
          //set up the card counter for sequential ordering of the cards
          let cardCtr = 1;
          //loop through all cards, start formatting and push the returned promise to the card promise array
          listCardInfo[list].forEach(card => {
            cardPromises.push(formatCard(card, members, boardCustomFields, cardCtr++));
          });
          //once all the cards are formatted, then add to the email object
          Promise.all(cardPromises).then(cards => {
            //add the name of the list to the main email string
            let listContent = [];
            //loop through all the card arrays, then concatentate the list content to one super array
            cards.forEach(_card => {
              listContent = listContent.concat(_card);
            });
            //set the listCardContent property to the array of list paragraphs
            listCardContent[list] = listContent;
            //resolve the list promise
            lResolve();
          });
        }
        else {
          //if there are no cards, add a statement that there are no projects and resolve
          listCardContent[list] = ['There are no projects in this list!'];
          lResolve();
        }
      });
      //push this promist to the master list of list promises
      lPromises.push(listPromise);
    });
    //once all the list promises are complete, write the file
    Promise.all(lPromises).then(() => {
      //get the date
      var now = new Date();
      //create an array of date parts [month, day, year]
      let dateParts = [(now.getMonth() + 1).toString(), now.getDate().toString(), now.getFullYear().toString()];
      //setup the file name as the date + a title
      let fileName = dateParts.join('') + '.progress.report.pdf'
      //set up the document definition for the pdfmake printer
      var docDefinition = {
        //init content with a super header of the pdf title + date
        content: [{
          text: 'Priority Report ' + dateParts.join('/'),
          style: 'superheader'
        }],
        defaultStyle: {
          font: 'Times'
        },
        //setup all styles used 
        styles: {
          superheader: {
            fontSize: 24,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 5, 0, 5]
          },
          subheader: {
            fontSize: 12,
            bold: true,
            margin:[0, 0, 0, 5]
          },
          listElement: {
            margin: [20, 0, 0, 10]
          }
        }
      };
      //for each list in sorted list names, push the name of the list with the header style and all the cards
      sortedListsNames.forEach(list => {
        docDefinition.content.push({
          text: list,
          style: 'header'
        });
        //cards are concatenated to the master content element. the formatter takes care of their styling
        docDefinition.content = docDefinition.content.concat(listCardContent[list]);
      });
      //create a pdf and write it
      var pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(fileName));
      pdfDoc.end();
      //resolve with the filename
      resolve(fileName);
    });

  });
  return promise;
};