# ra-jsonapi-client
[![CircleCI](https://circleci.com/gh/henvo/ra-jsonapi-client/tree/master.svg?style=svg)](https://circleci.com/gh/henvo/ra-jsonapi-client/tree/master)
[![npm version](https://badge.fury.io/js/ra-jsonapi-client.svg)](https://badge.fury.io/js/ra-jsonapi-client)

A JSONAPI compatible data provider for
[react-admin](https://github.com/marmelab/react-admin).


## Features
Currently these actions are supported:

* `GET_LIST`
* `GET_ONE`
* `CREATE`
* `UPDATE`
* `DELETE`
* `GET_MANY`
* `GET_MANY_REFERENCE`

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

In addition, if your server doesn't provide a count field, you can set *total
count* to `null`, and the provider will assume the total count is the same as
the length of the data array:

``` javascript
const dataProvider = jsonapiClient('http://localhost:3000', { total: null });
```

### Custom HTTP headers
Custom headers can be set by providing a `headers` object in `options`:

``` javascript
const settings = {
  headers: {
    Authorization: 'Bearer ...',
    'X-Requested-With': 'XMLHttpRequest'
  }
}
```
The default value is:
``` javascript
{
  Accept: 'application/vnd.api+json; charset=utf-8',
  'Content-Type': 'application/vnd.api+json; charset=utf-8',
}
```

### Authentication

This client assumes that you are using an
[authProvider](https://bit.ly/2NSYjS9) for your react-admin
application. In order to use authentication with your backend your authProvider
needs to store credentials in localStorage.

#### Basic auth

For basic auth your authProvider needs to store username and password like this:

``` javascript
localStorage.setItem('username', 'bob');
localStorage.setItem('password', 'secret');
```

#### Bearer Token

For authentication via (access) token your authProvider needs to store the token
like this:

``` javascript
localStorage.setItem('token', '123token');
```

### Update method (PUT vs. PATCH)
First versions used `PUT` as the default update HTTP method.
In version 0.5.0 this was changed to `PATCH` since it complies with the
JSONAPI standard.. You can still use `PUT` by declaring the update method in
the settings:

``` javascript
{
  // Set the update method from PATCH to PUT.
  updateMethod: 'PUT'
}
```

### Array format for `GET_MANY` filter
This package makes usage of the aweseome `qs` querystring parsing library.

Default: `brackets`
Options: `indices`, `repeat`, `comma`

## Contributors
* [TMiguelT](https://github.com/TMiguelT)
* [hootbah](https://github.com/hootbah)
* [770studio](https://github.com/770studio)
* [foxeg](https://github.com/foxeg)
