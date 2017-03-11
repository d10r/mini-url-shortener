# About

This is the most minimal version of an URL shortener I could imagine.
Probably it doesn't even deserve that name, because it leaves the task of key choice to the user.

It's a node based http service which offers 3 operations:
* Add / update an entry into the key/value store
* Query an entry from the key/value store
* Redirect (302) from key specific URL to value

# Install

Requirements: nodejs installed.
Not sure about the version requirement, probably node v6+ because ES6 destructuring is used.

Since there is a dependency ([node-persist](https://github.com/simonlast/node-persist)), a run of `npm install` is needed.

# Usage

Run with `npm run start` or `node main.js`.

The service binds to port 6135 on all interfaces.

## Lookup a key

Make a GET request for `/reg/<key>`

If the key was found, it will be returned as plain text.

## Register a key

Make a PUT request to /reg/<ke> with the raw value in the body. Example:

`curl -X PUT --data-ascii "http://verylonghostname.net/verylongurl" yourdomain.wtf/reg/k1` (yes, the wtf TLD really exists!)

**Important**: If a key already existed, it will be overwritten. If you want to avoid that, check if it exists before setting.

## Security

You can secure the registration request (PUT) by creating a file named `writekeys.json` in project root, containing an array of keys.
Example:
```json
[
	"aSecretKey",
	"anotherSecretKey"
]
```
This file will be parsed on start. If it's not found or can't be parsed, you will get a warning.

In order to use a key, add it as http header field `x-key`. Example:

`curl -X PUT -H "x-key: aSecretKey" --data-ascii "http://verylonghostname.net/verylongurl" yourdomain.wtf/reg/k1`

# TODO

* Non-destructive registration option (add only if not exists)
* DELETE option
