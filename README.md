# Black Flag Content Tools

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

### In-game Conversion

Conversion can also be performed from within a DnD5e game. It is possible export either a single document or an entire compendium. Simple instructions are listed below and a more in-depth tutorial is available at the bottom of this document.

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

TODO

## Conversion Tutorial

This tutorial will walk you though the process of converting several DnD5e compendiums in depth. In this example we will be bringing the classes, equipment, and spells from the DnD5e SRD into Black Flag.

### 1. Set up Environment

The first step is preparing everything for conversion. Ensure you have the latest version of the DnD5e and Black Flag systems installed as well as the latest version of this module. You will also need to set up a series of compendiums to receive the content. Compendiums can be in either the world or a module, but in this case the instructions assume you are using a custom module to hold the converted content. Follow the [Module Maker instructions](https://foundryvtt.com/article/module-maker/) on the Foundry site for information on this general process.

For this conversion I have created three compendiums within a newly created module. One will contain the classes, subclasses, and class features, a second will contain the equipment, and a third for the spells:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/compendium-setup.jpg?raw=true)

You will also need to have a DnD5e world and a Black Flag world set up with the "Black Flag Roleplaying Conversion Tools" module enabled in both.

### 2. Export from DnD5e

Next you will want to head into the DnD5e world to export and convert the content. In the Compendium Packs sidebar locate the compendiums you wish to export, in this case "Classes (SRD)", "Subclasses (SRD)", "Class & Subclass Features (SRD)", "Items (SRD)", and "Spells (SRD)". Right click on each of these packs and select "Export for Black Flag":

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/sidebar-export-for-black-flag.jpg?raw=true)

This will convert the contents of the compendium to Black Flag data and download a `.json` file for each pack. For larger compendiums such as the "Items (SRD)" pack this may take some time, so be patient for it to complete. Once you have repeated this process for all of the packs, you should find several `.json` files in your computer's downloads folder:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/exported-json.jpg?raw=true?raw=true)

### 3. Import into Black Flag

Now head over to the Black Flag world to import the content. In the Compendium Packs sidebar locate the compendium you wish to begin with, in this case the "D&D SRD Classes" compendium created in the custom module. Right click on that compendium and select "Import from DnD5e":

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/sidebar-import-from-dnd5e.jpg?raw=true)

This will bring up a file selection window. Use this window to select the first of the `.json` files from your downloads folder that you wish to import into this compendium:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/file-selection-dialog.jpg?raw=true)

Once you hit "Import", a new dialog will pop up with a summary of how many documents were found, an import button, and potentially some additional options:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/importer-classes.jpg?raw=true)

The options under the "Compendium Pack Remapping" header allow automatically changing links from the old compendium packs to new ones. Each of the listings has a name for a specific dnd5e pack, in this case `dnd5e.classfeatures` for the "Class Features (SRD)" compendium, `dnd5e.subclasses` for the "Subclasses (SRD)" compendium, and `dnd5e.rules` for the "Rules (SRD)" compendium.

The drop down on the right includes a list of all packs available in the current world. Selecting a pack here will cause any UUIDs used within the imported items to be replaced with references to the specified pack:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/pack-remapping-dropdown.jpg?raw=true)

Since we have created a single compendium for storing classes, subclasses, and their features, the dropdowns for `dnd5e.classfeatures` and `dnd5e.subclasses` should be changed to point to the new "D&D SRD Classes" compendium:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/pack-remapping-complete.jpg?raw=true)

Once all of these fields have been set, click the "Import Documents" button to complete the process. Again this may take some time to create all the documents, especially for larger compendiums like "Items (SRD)" which contains hundreds of documents to import.

When the importing is complete, repeat the process with all the other `.json` files exported earlier. Each file may have slightly different options for the pack remapping, such as these for the "Class && Subclass Features (SRD)" compendium:

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/importer-class-features.jpg?raw=true)

### 4. Enjoy

Now everything should be fully imported over! Note that the importer will try its best, but certain things might need manual adjustment. Its always a good idea to give you newly imported content a review to ensure everything is set up how you like it. If anything seems to have obviously imported incorrectly, feel free to file an issue on the [bug tracker](https://github.com/koboldpress/black-flag-tools/issues).

![](https://github.com/koboldpress/black-flag-tools/blob/main/assets/instructions/imported-content.jpg?raw=true)
