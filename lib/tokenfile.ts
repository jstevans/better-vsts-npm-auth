import { Config } from './config';

export const k_REFRESH_TOKEN = 'refresh_token';

export interface ITokenfileDictionary {
  [k_REFRESH_TOKEN]: string;
}

export default class Tokenfile extends Config<ITokenfileDictionary> {
  constructor(configPath: string) {
    super(configPath, ["refresh_token"]);
  }
};