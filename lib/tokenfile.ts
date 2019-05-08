import { Config } from './config';

export const k_REFRESH_TOKEN = 'refresh_token';

export interface ITokenfileDictionary {
  [k_REFRESH_TOKEN]: string;
}

export const defaultTokenfile = { [k_REFRESH_TOKEN]: "" };

export default class Tokenfile extends Config<ITokenfileDictionary> {
  constructor(configPath: string) {
    super(configPath, { [k_REFRESH_TOKEN]: "" });
  }
};