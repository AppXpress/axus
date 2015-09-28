![axus](axus.jpg)

## Running locally against the REST API

Your project will need a `appx.json` file in the project's root. This file contains the username, password, and dataKey needed to authenticate with the service, as well as the base url of the intended service. Here's an example `appx.json` file:

```json
{
  "username": "john.doe@gtnexus",
  "password": "secretcatchphrase",
  "dataKey": "36f71b26bca202c61973809143a58f7b12fe42a8",
  "url": "https://commerce-supportq.qa.gtnexus.com/rest/"
}
```

To import the RESTful Providers along with your module:

```js
let test-support = require('appx-test-support');
test-support.requireRest('../path/to/my/script');
```

Node assumes all `IO` to be asynchronous. However, the AppXpress Providers operate
in a synchronous manner. AppX-Test-Support relies on [synchronize.js](http://alexeypetrushin.github.io/synchronize/docs/index.html)
in order to simulate a synchronous environment.

Any code relying on `Providers.rest` will need to be wrapped as such:

```js
let sync = require('synchronize');
sync.fiber(() => {
  //your code goes here
});
```

## Running against a local store

Being able to hit the REST api is great, but not ideal for unit testing. We want our unit tests to run quickly. For this reason, AppX-Test-Support also exposes a `requireLocal`. Require local takes an extra argument, which is passed to the Providers to act as its own local data store.

### The Current Data Store Model and Limitations of the Local Store

`appx-test-support` currently lacks the ability to parse oql. To get around this limitation, the local store used to seed the local provider is expected to be in the following format:

```json
{
  "globalType": {
    "oql-string" : [

    ]
  },
  "anotherGlobalType": {
    "another oql-string" : [

    ]
  }
}
```

# How it works

These details are abstracted away by the appx-test-support library, but in the interest of education...

AppXpress Modules are not *node-aware*, and are not ES6 compliant, there is no idea of a module system.
As a result, we cannot `require` or `import` our appx modules in the traditional sense.

To be brief, we supply node a sandbox and a script to run in that sandbox. The sandbox is an object wrapping the global dependencies of the script. In our case, the sandbox merely contains the Providers, which are really the only globals available in the AppXpress platform. The context returned is bound to the  Providers instance that is present in the sandbox.

The [companion](https://github.com/rockgolem/companion) module does almost exactly what we need it to, with one caveat--companion doesn't always correctly resolve
paths when it is required from another dependency. You can check out my fork of companion and quick fix [here](https://github.com/jjdonov/companion).