import { writeFileSync, readFileSync } from "fs";
import { encode, parse } from "ini";


export const defaults = {
  clientId: "DE516D90-B63E-4994-BA64-881EA988A9D2",
  redirectUri: "https://stateless-vsts-oauth.azurewebsites.net/oauth-callback",
  tokenEndpoint: "https://stateless-vsts-oauth.azurewebsites.net/token-refresh",
  tokenExpiryGraceInMs: "1800000",
};

export interface IConfigDictionary {
  clientId?: string;
  redirectUri?: string;
  tokenEndpoint?: string;
  tokenExpiryGraceInMs?: string;
  tokenfile?: string;
}

/**
 * Represents the user configuration for better-vsts-npm-auth
 * and presents an interface for interactions with it.
 */
export class Config<T extends any = IConfigDictionary> {
  constructor(
    private configPath: string,
    private configKeys: (keyof T)[] = Object.keys(defaults)) { };

  /**
   * Checks whether a key is valid for this config
   */
  isKeyValid(key: string | number | symbol): key is keyof T {
    return this.configKeys.indexOf(key as any) != -1;
  }

  /**
   * Adds or updates the given setting and writes it
   * to the configuration file.
   */
  set<K extends keyof T>(key: K, val: T[K]) {
    let configObj = this.get();

    configObj[key] = val;

    this.write(configObj);
  }

  /**
   * Forces a write of the given object to the
   * configuration file.
   */
  write(obj: T | {}) {
    let configContents = encode(obj);
    writeFileSync(this.configPath, configContents);
  }

  /**
   * Clear the contents of the config by writing
   * an empty dictionary.
   */
  clear() {
    this.write({});
  }

  /**
   * Delete a key from the dictionary
   */
  delete(key: keyof T) {
    const configObj = this.get();
    delete configObj[key];
    this.write(configObj);
  }

  /**
   * Reads the configuration file from disk and
   * returns the parsed config object.
   */
  get(): T {
    let configContents = "";

    try {
      // we're deliberately using a sync call here because
      // otherwise the yargs command doesn't prevent the
      // rest of the program from running
      configContents = readFileSync(this.configPath, "utf8");
    } catch (e) {
      // the config file is optional, so if it doesn't exist
      // just swallow the error and return the default (empty)
      // object. Otherwise, throw the error.
      if (e.code !== "ENOENT") {
        throw e;
      }
    }

    let configObj = parse(configContents);
    // merge with defaults, with user specified config taking precedence
    return Object.assign({}, defaults, configObj) as T;
  }
}
