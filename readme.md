# Commander Tracker

A simple web application to help generate SQL stored procedure calls for Magic: The Gathering cards using the Scryfall API.

## Features

- Search for Magic cards using Scryfall's autocomplete API
- Preview card images
- Edit card details before generating SQL
- Generate SQL stored procedure calls
- Save work in progress using localStorage
- Copy all generated SQL statements at once
- Remove cards from the list

## Setup

1. Clone this repository
2. Open index.html in your web browser
3. Start searching for cards!

No package manager or build process required - this is a pure HTML/JS/CSS application.

## Usage

1. Type a card name in the search box
2. Select a card from the autocomplete dropdown
3. Review and edit the card details if needed
4. Click "Add Card" to generate the SQL
5. Repeat for additional cards
6. Use the "Copy All SQL" button to copy the generated statements

## Error Handling

The application will display errors in the following cases:
- API errors from Scryfall
- Network connectivity issues
- Invalid data validation
- Missing required fields

## Database Schema

The application is designed to work with a specific database schema. Key tables include:

- Card_Rarity (Common, Uncommon, Rare, Mythic Rare)
- Card_Type (Artifact, Battle, Creature, etc.)
- Card_Supertype (Basic, Legendary, etc.)
- Mana_Colors
- Color_Identity
- Combat_Abilities

## Contributing

This is a simple tool for a specific use case. Feel free to fork and modify for your needs.

## License

MIT