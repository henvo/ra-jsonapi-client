import chai from 'chai';
import nock from 'nock';
import chaiAsPromised from 'chai-as-promised';
import matches from 'lodash.matches';

import jsonapiClient from '../src/index';
import getList from './fixtures/get-list';
import getListNoMeta from './fixtures/get-list-no-meta';
import getOne from './fixtures/get-one';
import getOneLinkage from './fixtures/get-one-relationship-linkage';
import getOneIncluded from './fixtures/get-one-relationship-included';
import getOneLinks from './fixtures/get-one-relationship-links';
import create from './fixtures/create';
import update from './fixtures/update';
import getMany from './fixtures/get-many';
import getManyReference from './fixtures/get-many-reference';
import getManyIncluded from './fixtures/get-many-relationship-included';

chai.use(chaiAsPromised);

const { expect } = chai;

const client = jsonapiClient('http://api.example.com', {
  total: 'total-count',
});

let result;

/**
 * Adds IDs to all resources in the request, to simulate the request being saved to a database
 */
function addIds(url, req) {
  req = JSON.parse(req);
  let current_id = 1;
  if (req.data instanceof Array) {
    for (let datum of req.data) {
      datum.id = current_id++;
    }
  } else {
    req.data.id = current_id++;
  }

  if (req.included) {
    for (let datum of req.included) {
      datum.id = current_id++;
    }
  }

  return req;
}

describe('GET_LIST', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get(/users.*sort=name.*/)
      .reply(200, getList);

    return client('GET_LIST', 'users', {
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'name', order: 'ASC' },
    })
      .then((data) => {
        result = data;
      });
  });

  it('returns an object', () => {
    expect(result).to.be.an('object');
  });

  it('has a data property', () => {
    expect(result).to.have.property('data');
  });

  it('contains the right count of records', () => {
    expect(result.data).to.have.lengthOf(5);
  });

  it('contains valid records', () => {
    expect(result.data).to.deep.include({ id: 1, name: 'Bob' });
  });

  it('contains a total property', () => {
    expect(result).to.have.property('total').that.is.equal(5);
  });
});

describe('GET_MANY_REFERENCE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get(/users.*company_id.*=1/)
      .reply(200, getManyReference);

    return client('GET_MANY_REFERENCE', 'users', {
      pagination: { page: 1, perPage: 25 },
      target: 'company_id',
      id: 1,
    })
      .then((data) => {
        result = data;
      });
  });

  it('returns an object', () => {
    expect(result).to.be.an('object');
  });

  it('has a data property', () => {
    expect(result).to.have.property('data');
  });

  it('contains the right count of records', () => {
    expect(result.data).to.have.lengthOf(5);
  });

  it('contains valid records', () => {
    expect(result.data).to.deep.include({ id: 1, name: 'Bob' });
  });

  it('contains a total property', () => {
    expect(result).to.have.property('total').that.is.equal(5);
  });
});

[
  ['simple', getOne, {}],
  ['links only', getOneLinks, {}],
  ['resource linkage', getOneLinkage, { address: { id: '2' } }],
  ['included data', getOneIncluded, {
    address: {
      id: '2',
      street: 'Pinchelone Street',
      number: 2475,
      city: 'Norfolk',
      state: 'VA',
    },
  },
  ],
].map(([key, response, relationships]) => {
  describe(`GET_ONE "${key}"`, () => {

    beforeEach(() => {
      nock('http://api.example.com')
        .get('/users/1')
        .reply(200, response);

      return client('GET_ONE', 'users', { id: 1 })
        .then((data) => {
          result = data;
        });
    });

    it('returns an object', () => {
      expect(result).to.be.an('object');
    });

    it('has record ID', () => {
      expect(result.data).to.have.property('id').that.is.equal('1');
    });

    it('has records attributes', () => {
      expect(result.data).to.have.property('name').that.is.equal('Bob');
    });

    it('has the correct relationship value', () => {
      expect(result.data).to.deep.include(relationships);
    });
  });
});

[
  [
    'simple',
    getOne,
    { name: 'Bob' },
  ],
  [
    'linkage',
    getOneLinkage,
    { name: 'Bob', address: { id: '2' } }],
  [
    'included',
    getOneIncluded,
    {
      name: 'Bob',
      address: {
        id: '2',
        street: 'Pinchelone Street',
        number: 2475,
        city: 'Norfolk',
        state: 'VA',
      },
    },
  ],
].map(([key, serialized, unserialized]) => {
  describe(`CREATE ${key}`, () => {
    beforeEach(() => {
      nock('http://api.example.com')
        .post('/users', body => {
          // Check that the we serialized correctly
          return matches(serialized, body);
        })
        .reply(201, addIds);

      return jsonapiClient('http://api.example.com', {
        serializerOpts: {
          // Options for all "user" resources
          user: {
            // Options for the "address" field on a "user"
            address: {
              // The ID of an address is given by its id field
              ref: (user, address) => address.id,
            },
          },
        },
      })('CREATE', 'users', { data: unserialized })
        .then(data => {
          result = data;
        });
    });

    it('returns an object', () => {
      expect(result).to.be.an('object');
    });

    it('has record ID', () => {
      expect(result.data).to.have.property('id').that.is.equal(1);
    });

    it('has records attributes', () => {
      expect(result.data).to.have.property('name').that.is.equal('Bob');
    });

    it('completed a round trip', () => {
      expect(result.data).to.deep.include(unserialized);
    });
  });
});

describe('UPDATE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .patch('/users/1')
      .reply(200, update);

    return client('UPDATE', 'users', { id: 1, data: { name: 'Tim' } })
      .then((data) => {
        result = data;
      });
  });

  it('returns an object', () => {
    expect(result).to.be.an('object');
  });

  it('has record ID', () => {
    expect(result.data).to.have.property('id').that.is.equal(1);
  });

  it('has records attributes', () => {
    expect(result.data).to.have.property('name').that.is.equal('Tim');
  });
});

describe('DELETE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .delete('/users/1')
      .reply(204, null);

    return client('DELETE', 'users', { id: 1 })
      .then(data => {
        result = data;
      });
  });

  it('returns an object', () => {
    expect(result).to.be.an('object');
  });

  it('has record ID', () => {
    expect(result.data).to.have.property('id').that.is.equal(1);
  });
});

describe('UNDEFINED', () => {
  it('throws an error', () => {
    expect(() => client('UNDEFINED', 'users')).to.throw(Error, /Unsupported/);
  });
});

describe('Unauthorized request', () => {
  beforeEach(() => {
    nock('http://api.example.com').get('/users/1').reply(401);
  });

  it('throws an error', () => {
    expect(client('GET_ONE', 'users', { id: 1 }))
      .to.eventually
      .be.rejected
      .and.have.property('status');
  });
});

[
  ['simple', getMany, {}],
  ['included data', getManyIncluded, {
    address: {
      id: '9',
      street: 'Pinchelone Street',
      number: 2475,
      city: 'Norfolk',
      state: 'VA',
    },
  },
  ],
].map(([key, response, relationships]) => {
  describe(`GET_MANY "${key}"`, () => {
    beforeEach(() => {
      nock('http://api.example.com')
        .get('/users')
        .query(true)
        .reply(200, response);

      return client('GET_MANY', 'users', { ids: [1] })
        .then((data) => {
          result = data;
        });
    });

    it('returns an object', () => {
      expect(result).to.be.an('object');
    });

    it('has a data property', () => {
      expect(result).to.have.property('data');
    });

    it('contains the right count of records', () => {
      expect(result.data).to.have.lengthOf(1);
    });

    it('contains valid records', () => {
      expect(result.data[0]).to.include({ id: 1, name: 'Bob' });
    });

    it('contains a total property', () => {
      expect(result).to.have.property('total').that.is.equal(1);
    });

    it('has the correct relationship value', () => {
      expect(result.data[0]).to.deep.include(relationships);
    });
  });
});

// This test should work exactly the same as the normal GET_LIST test, but the
// returned data has no meta field, and thus no count variable. We set the
// count variable to null in the client
describe('GET_LIST with {total: null}', () => {
  it('contains a total property', () => {
    nock('http://api.example.com')
      .get(/users.*sort=name.*/)
      .reply(200, getListNoMeta);

    const noMetaClient = jsonapiClient('http://api.example.com', {
      total: null,
    });

    return expect(noMetaClient('GET_LIST', 'users', {
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'name', order: 'ASC' },
    })).to.eventually.have.property('total').that.is.equal(5);
  });
});

describe('CREATE with custom serializerOpts and deserializerOpts', () => {
  it('loads an underscore_case relationship, and deserializes it to CamelCase', () => {
    nock('http://api.example.com')
      .post('/data')
      .reply(200, addIds);

    const underscoreClient = jsonapiClient('http://api.example.com', {
      serializerOpts: {
        data: {
          keyForAttribute: 'underscore_case',
          data_type: {
            ref: (outer, inner) => inner.id,
          },
        },
      },
      deserializerOpts: {
        data: {
          keyForAttribute: 'CamelCase',
        },
      },
    });

    return underscoreClient('CREATE', 'data', {
      data: {
        value: 23,
        data_type: {
          id: 2,
        },
      },
    }).then((response) => {
      expect(response.data).to.deep.equal({
        id: 1,
        Value: 23,
        DataType: {
          id: 2,
        },
      });
    });
  });
});
