# Black Flag Roleplaying Content Tools

These tools are designed to aid in converting [DnD5e](https://github.com/foundryvtt/dnd5e) content into [Black Flag Roleplaying](https://github.com/koboldpress/black-flag/) content as well as parsing content from PDFs.

**Note**: The conversion tools are built to work for DnD5e version `4.1`, older data should be migrated to be compatible with this version and newer data should not be converted until the tools are updated.

## Installation

There are two different ways to install this module depending on whether you intend to use the conversion tools from within Foundry or through the command line.

### In-game Installation

1. Launch Foundry
2. Go to the "Add-on Modules" tab of the setup screen
3. Click "Install Module"
4. Paste the following manifest into the "Manifest URL" field: `https://github.com/koboldpress/black-flag-tools/releases/latest/download/module.json`
5. Click "Install"

### Command Line Installation

1. Clone this repo using `git clone https://github.com/koboldpress/black-flag-tools.git`
2. Navigate to the new module folder using the command line
3. Run `npm install` to set up the dependencies

## Content Conversion

The conversion tools are designed to turn content compatible with the DnD5e system into content compatible with the Black Flag system. Because of the differences in how items and actors are set up in the two systems a proper conversion step must be done.

There are a few things that conversion currently does not cover:
1. **PCs**: Due to the large differences in how PCs are handled between the two systems, they cannot be converted. Instead convert the individual classes, spells, and equipment you wish to use with your PC and then re-create it within Black Flag.
2. **Adventures**: The conversion system currently cannot handle adventure documents. Hopefully this will be possible in the future.
3. **Active Effects**: No attempt is made to convert active effect keys and values between the two systems. If the content you are converting contains active effects, you will have to manually adjust them to match Black Flag using the references available in the [Active Effects Guide](https://koboldpress.github.io/black-flag-docs/documentation/active-effects).

### In-game Conversion

Conversion can also be performed from within a DnD5e game. It is possible export either a single document or an entire compendium. Simple instructions are listed below and a more in-depth tutorial can be found on the [Black Flag documentation site](https://koboldpress.github.io/black-flag-docs/documentation/conversion-tutorial).

#### Single Document

1. Launch into DnD5e world
2. Locate document in Compendium
3. Right click on document in list and select "Export for Black Flag"
4. Launch into Black Flag world
5. Create new Actor or Item document
6. Right click on document in list and select "Import Data"
7. Browse and select the downloaded JSON file

**Note**: Single document conversion does not handle Compendium remapping that is possible using full compendium conversion

#### Full Compendium

1. Launch into DnD5e world
2. Right click on compendium in sidebar and select "Export for Black Flag"
3. Launch into Black Flag world
4. Unlock target compendium (either freshly created world compendium or one in a module)
5. Right click on compendium in list and select "Import from DnD5e"
6. Browse and select the downloaded JSON file
7. Make any selections necessary for compendium remapping
8. Click "Import Documents"

### Command Line Conversion

This tool is used to convert `json` files exported from DnD5e compendiums to `json` files that are compatible with Black Flag. It assumes you are already using Foundry's official CLI to extract your module database to source files. Usage is simple and at the moment there isn't any configuration:

1. Extract your module's database using the Foundry CLI
2. Place extracted source `json` files into the `_sources` directory in this repo
3. Run `npm run convert`
4. Copy the newly converted files from the `_converted` directory back to your module
5. Compile a new compendium database using the Foundry CLI

## Parsing

The parsing tool allows importing items from plain text into the Black Flag system. The parser is designed to work with text formatting in the standard Black Flag style. It currently works for spells and magic items. A detailed guide to its use can be found on the [documentation site](https://koboldpress.github.io/black-flag-docs/documentation/parsing-tutorial).
