# MTG Stored Procedure Helper

A simple web application to help generate stored procedure calls for Magic: The Gathering cards using the Scryfall API.

## Features

- Search for Magic cards using Scryfall's autocomplete API
- Preview card images
- Edit card details before generating SQL
- Generate stored procedure calls in the correct format
- Save work in progress using localStorage
- Copy all generated SQL statements at once
- Remove cards from the list if needed

## Usage

1. Clone this repository
2. Open `index.html` in your browser
3. Start typing a card name in the search box
4. Select a card from the dropdown
5. Edit details if needed and click "Add Card"
6. Copy the generated SQL when ready

## No Dependencies

This project intentionally uses no external dependencies or package management. It's pure HTML, CSS, and JavaScript that runs directly in the browser.

## API Usage

This project uses the Scryfall API:
- Autocomplete endpoint for card search
- Card details endpoint for full card information

## Database Structure

The generated stored procedure calls are formatted for a specific database structure with the following tables:
- Card_Rarity
- Card_Type
- Card_Supertype
- Mana_Colors
- Color_Identity
- Combat_Abilities

## Error Handling

Errors are displayed directly on the page for:
- API connection issues
- Invalid card data
- Validation errors
