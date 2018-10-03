# ra-jsonapi-client
[![Build Status](https://travis-ci.org/henvo/ra-jsonapi-client.svg?branch=master)](https://travis-ci.org/henvo/ra-jsonapi-client)

A JSONAPI compatible data provider for
[react-admin](https://github.com/marmelab/react-admin).


## Features
Currently only the basic actions are supported:

* `GET_LIST`
* `GET_ONE`
* `CREATE`
* `UPDATE`
* `DELETE`

## Installation

```sh
# via npm
npm install ra-jsonapi-client

# via yarn
yarn add ra-jsonapi-client
```

## Usage

Import this package, set the base url and pass it as the dataProvider to
react-admin.

```javascript
//in app.js
import React from "react";
import { Admin, Resource } from "react-admin";
import jsonapiClient from "ra-jsonapi-client";

const dataProvider = jsonapiClient('http://localhost:3000');

const App = () => (
  <Admin dashboard={Dashboard} dataProvider={dataProvider}>
    ...
  </Admin>
);

export default App;
```

## Options
This client allows you to set some optional settings as the second parameter:

``` javascript
// Configure some settings.
const settings = { ... };

// Pass it as the second parameter after the base URL.
const dataProvider = jsonapiClient('http://localhost:3000', settings);
```

### Total count
Since JSONAPI [does not specify](http://jsonapi.org/examples/#pagination)
a standard for the *total count* key in the meta object, you can set it with:

``` javascript
const settings = { total: 'total-count' };
```

Which will work for:
``` json
{
  "data": { ... },
  "meta": {
    "total-count": 436
  }
}
```


If this option is not set it will fall back to `total`.

## TODO

* Allow custom headers (e.g. Authorization)
* Allow filtering
