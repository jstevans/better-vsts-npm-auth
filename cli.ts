#!/usr/bin/env node

import { Config } from "./lib/config";
import { auth } from "./index";
import { join } from "path";
import * as yargs from "yargs";
import Tokenfile, { k_REFRESH_TOKEN } from "./lib/tokenfile";
const DEFAULT_CONFIG_PATH = join(process.cwd(), ".devopsauthrc");
const DEFAULT_TOKENFILE_PATH = join(process.cwd(), ".devopsauthtoken");
const input = require("input");

interface IKeyValuePair {
  key: string;
  value: string;
}

function validateKey<T>(config: Config<T>, key: string): key is keyof T {
  if (!config.isKeyValid(key)) {
    throw new Error(`can't set "${key}" on config: "${key}" is not a valid config setting.`);
  }
  return true;
}

function configSetter(config: Config, _tokenfile: Tokenfile, argv: IKeyValuePair) {
  validateKey(config, argv.key) && config.set(argv.key, argv.value);
}

function configGetter(config: Config, _tokenfile: Tokenfile, key: string) {
  if (key && validateKey(config, key)) {
    let configObj = config.get();
    let configEntry = configObj[key];

    if (configEntry) {
      console.log(configEntry);
    }
  }
}

async function configDeleter(config: Config, _tokenfile: Tokenfile, key: string): Promise<void> {
  if (key && validateKey(config, key)) {
    let configObject = config.get();
    delete configObject[key];
    config.write(configObject);
  } else {
    // delete the whole config, once user confirms
    let deleteConfig = await input.confrim(
      "Are you sure you want to delete your config file?"
    );
    if (deleteConfig === true) {
      config.clear();
    }
  }
}

function tokenSetter(_config: Config, tokenfile: Tokenfile, value: string) {
  tokenfile.set(k_REFRESH_TOKEN, value);
}

function tokenGetter(_config: Config, tokenfile: Tokenfile) {
  let configObj = tokenfile.get();
  let configEntry = configObj[k_REFRESH_TOKEN];

  if (configEntry) {
    console.log(configEntry);
  }
}

async function tokenDeleter(_config: Config, tokenfile: Tokenfile): Promise<void> {
  // delete the whole config, once user confirms
  let deleteConfig = await input.confrim(
    "Are you sure you want to delete your config file?"
  );
  if (deleteConfig === true) {
    tokenfile.clear();
  }
}

async function run(config: Config, tokenfile: Tokenfile, args: any) {
  try {

    auth(config, tokenfile, args);

  } catch (e) {

    if (e.consentUrl) {
      require('opn')(e.consentUrl);
      delete e['consentUrl'];
    }

    if (e.message) {
      console.error(e.message);
    }

    if (args.stack === true) {
      throw e;
    }

    process.exit(1);
  }

}

function commandBuilder(cmd: (config: Config, tokenfile: Tokenfile, args: any) => void | Promise<void>): (args: any) => void {
  return async (args: any) => {
    let config = new Config(args.configOverride || DEFAULT_CONFIG_PATH);
    let tokenfilePath = args.tokenfile || config.get().tokenfile || DEFAULT_TOKENFILE_PATH;
    let tokenfile = new Tokenfile(tokenfilePath);
    let promise = cmd(config, tokenfile, args);
    if (promise) {
      await promise;
    }
    process.exit(0);
  };
}

yargs
  .usage("Usage: $0 [command] [options]")
  .example("$0", "process the local .npmrc file")
  .example(
    "$0 -n /foo/bar/.npmrc -c /baz/bang/.bettervstsnpmauthcfg",
    "process the .npmrc file located at /foo/bar, use /baz/bang/.bettervstsnpmauthcfg as the config file"
  )
  .example("$0 config foo bar", 'set a config value "foo" to be "bar"')
  .options("n", {
    alias: "npmrcPath",
    describe: "path to npmrc config",
    type: "string"
  })
  .options("c", {
    alias: "configOverride",
    describe: "alternate path to this tool's configuration file",
    type: "string"
  })
  .options("stack", {
    describe: "print the stack trace on error",
    type: "boolean"
  })
  .command({
    command: "config [command]",
    describe: 'modify the config (run "config --help" for more info)',
    builder: (yargs: any) =>
      yargs
        .command({
          command: "set <key> <value>",
          describe: "Set a config variable",
          handler: commandBuilder(configSetter)
        })
        .command({
          command: "get [key]",
          describe: "Get a config variable",
          handler: commandBuilder(configGetter)
        })
        .command({
          command: "delete [key]",
          describe:
            "Delete a config variable. If the variable is not supplied, deletes the entire config.",
          handler: commandBuilder(configDeleter)
        }),
    handler: commandBuilder(configGetter)
  })
  .command({
    command: "token [command]",
    describe: 'modify the config (run "token --help" for more info)',
    builder: (yargs: any) =>
      yargs
        .command({
          command: "set [value]",
          describe: "Set the token",
          handler: commandBuilder(tokenSetter)
        })
        .command({
          command: "get",
          describe: "Get the token",
          handler: commandBuilder(tokenGetter)
        })
        .command({
          command: "delete",
          describe:
            "Clear the token file.",
          handler: commandBuilder(tokenDeleter)
        }),
    handler: commandBuilder(tokenGetter)
  })
  .command({
    command: "$0",
    describe: 'authenticate the user to NPM based on the settings provided',
    handler: commandBuilder(run)
  })
  .help().parse();

// safety first - handle and exit non-zero if we run into issues
let abortProcess = (e: Error) => {
  console.log(e);
  process.exit(1);
};
process.on("uncaughtException", abortProcess);
process.on("unhandledRejection", abortProcess);