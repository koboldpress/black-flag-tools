## Black Flag Content Tools

These tools are designed to aid in converting DnD5e content and book content into Black Flag content. At the moment they are oriented towards module developers interested in performing bulk conversion rather than individual users.

### Installation

1. Clone this repo
2. Run `npm install` to set up the dependencies

### Bulk Conversion

This tool is used to convert `json` files exported from DnD5e compendiums to `json` files that are compatible with Black Flag. It assumes you are already using Foundry's official CLI to extract your module database to source files. Usage is simple and at the moment there isn't any configuration:

1. Extract your module's database using the Foundry CLI
2. Place extracted source `json` files into the `_sources` directory in this repo
3. Run `npm run convert`
4. Copy the newly converted files from the `_converted` directory back to your module
5. Compile a new compendium database using the Foundry CLI
