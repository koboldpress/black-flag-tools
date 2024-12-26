import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import * as types from "../types.mjs";
import { TOOLS } from "../utils.mjs";
import convertCommand from "./convert.mjs";

Object.assign(TOOLS, types);

const argv = yargs(hideBin(process.argv)).command(convertCommand()).help().alias("help", "h").argv;
