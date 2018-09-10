# ra-jsonapi-client

A JSONAPI compatible data provider for
[react-admin](https://github.com/marmelab/react-admin).

**Disclaimer**: This project is a work in progress and is missing some basic
actions (e.g. deleting resources).

## Installation

ra-jsonapi-client is available from npm.

```sh
# via npm
npm install ra-jsonapi-client

# via yarn
yarn add ra-jsonapi-client
```

## Usage

```js
//in app.js
import React from "react";
import { Admin, Resource } from "react-admin";
import raJsonapiClient from "ra-jsonapi-client";

const dataProvider = raJsonapiClient('http://localhost:3000');

const App = () => (
  <Admin dashboard={Dashboard} dataProvider={dataProvider}>
    ...
  </Admin>
);

export default App;
```
