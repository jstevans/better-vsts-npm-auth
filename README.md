# devops-npm-auth

A temporary fork of [`better-vsts-npm-auth`](https://github.com/zumwald/better-vsts-npm-auth) while some config-related changes are upstreamed.

[![CircleCI](https://circleci.com/gh/zumwald/better-vsts-npm-auth/tree/master.svg?style=svg)](https://circleci.com/gh/zumwald/better-vsts-npm-auth/tree/master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Installation

While not necessary, _devops-npm-auth_ was built to be used as a global module.
For long-term use, please `npm i -g devops-npm-auth`. To test, try `npx devops-npm-auth`.

## Usage

### Command line

Best for ad-hoc cases. The CLI comes with fully descriptive help docs, you can run them via `better-vsts-npm-auth --help`.

### API

`index.ts` provides a relatively simple interface if you prefer a different CLI, or need to wrap this tool.


### Configuration

`better-vsts-npm-auth` (and thus `devops-npm-auth`) stores its config in INI format. 

#### OAuth client service
In order to retrieve NPM tokens without leaving user credentials lying around on the machine, `better-vsts-npm-auth` uses Azure DevOps' OAuth flow ([documented here](https://docs.microsoft.com/en-us/vsts/integrate/get-started/authentication/oauth)), which requires an internet-facing service to complete token exchanges on the user's behalf. While you're welcome to use an existing service if you have one or build your own if you're so inclined, the author of `better-vsts-npm-auth` also publishes [`stateless-vsts-oauth`](https://github.com/zumwald/stateless-vsts-oauth) and hosts a public reference endpoint at https://stateless-vsts-oauth.azurewebsites.net, which this tool uses by default.

* `redirectUri` and `tokenEndpoint` are URLs of the OAuth client service, which is used to retrieve new NPM tokens. `redirectUri` is the URL that DevOps should redirect to after a user grants permission to the OAuth client service. `tokenEndpoint` is the URL that `devops-npm-auth` should send requests for to refresh its NPM token.
* `clientId` is the App ID of the OAuth client service, and is used (along with` redirectUri`) when forming the URL for new users to grant permissions to the OAuth client service.

#### Local/user config
Once the user's token is retrieved, it must be stored somewhere. Since this tool is used for authentication to private registries, by default it stores the tokens generated for a given repo in a `.betteradoauthtokens` "tokenfile" at the root of that repo.

* `tokenfile` allows for a repo to specify an absolute or relative path that should be used for the tokenfile, instead.

## Prior art

While incomplete - the lack of support for \*nix systems was perplexing - [vsts-npm-auth](https://www.npmjs.com/package/vsts-npm-auth) laid the foundation for this project in principle.
