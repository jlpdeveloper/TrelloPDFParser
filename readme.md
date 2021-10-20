# Trello Progress PDF Creator

This program is designed to create an pdf file to be sent for progress on a trello board. My boss doesn't like trello and prefers email, so I've developed this software to take the notes from trello and generate a pdf to his liking from the information on trello. The system asks you to put in your username and the name of the board you want to export from. Then it asks you what lists you want from the board and what order you want them in.

The PDF will have the list name in bold, then each card will be numbered. There will be info below the card name about who is on the card, the status, and the QA Release date.

## Required Custom Fields
- Status: A select type custom field
- QA Release Date: A date type custom field

## Setup Instructions
1. Visit [Trello Api Key](https://trello.com/app-key) to get your api key. Add the API key to the config
2. Directly under the api key, there is a generate token, follow the wizard and copy your token into your config

```
{
    "apikey": "your-api-key",
    "apitoken": "your-api-token"
}

```

3. Run `node app.js` . This will prompt you to input a username and the name of the board you want to get info from
4. The program will get info about the board, board members, and the custom fields on the board
5. The program will then ask you what lists from the board you want to export. From that list, it will ask you what order you want those in. You have to specify the order because the api calls are asynchronus, so without this order, you have no idea what order they'll be in.
6. The system will then gather info on each card and create the pdf.It will alert you to file name of the pdf. 

## Important Concepts Learned from This Project

- How to use the Trello API 
- Lots of Node.js promises
- How to get information efficiently for Trello

## Future Considerations

- This might be good as a powerup
- Auto send the email to a destination

## Links
- [Trello API Key](https://trello.com/app-key)
- [Trello API Introduction](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/)
- [Trello API Reference](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/)
