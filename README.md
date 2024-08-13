## Black Flag Content Tools

These tools are designed to aid in converting DnD5e content and book content into Black Flag content.

**Note**: The conversion tools are built to work for DnD5e version `3.3`, older data should be migrated to be compatible with this version and newer data should not be converted until the tools are updated.

### Installation

1. Clone this repo
2. Run `npm install` to set up the dependencies

### Command Line Conversion

This tool is used to convert `json` files exported from DnD5e compendiums to `json` files that are compatible with Black Flag. It assumes you are already using Foundry's official CLI to extract your module database to source files. Usage is simple and at the moment there isn't any configuration:

1. Extract your module's database using the Foundry CLI
2. Place extracted source `json` files into the `_sources` directory in this repo
3. Run `npm run convert`
4. Copy the newly converted files from the `_converted` directory back to your module
5. Compile a new compendium database using the Foundry CLI

### In-game Conversion

Conversion can also be performed from within a DnD5e game. It is possible export either a single document or an entire compendium.

#### Single Document

1. Launch into DnD5e world
2. Locate document in Compendium
3. Right click on document in list and select "Export for Black Flag"
4. Launch into Black Flag world
5. Create new Actor or Item document
6. Right click on document in list and select "Import Data"
7. Browse and select the downloaded JSON file

#### Full Compendium

1. Launch into DnD5e world
2. Right click on compendium in sidebar and select "Export for Black Flag"
3. Launch into Black Flag world
4. Unlock target compendium (either freshly created world compendium or one in a module)
5. Right click on compendium in list and select "Import from DnD5e"
6. Browse and select the downloaded JSON file

