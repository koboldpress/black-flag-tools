import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import convertCommand from "./convert.mjs";

const argv = yargs(hideBin(process.argv))
	.command(convertCommand())
	.help().alias("help", "h")
	.argv;
