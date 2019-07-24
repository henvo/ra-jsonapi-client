import chai from 'chai';
import nock from 'nock';
import chaiAsPromised from 'chai-as-promised';

import jsonapiClient from '../src/index';
import getList from './fixtures/get-list';
import getManyReference from './fixtures/get-many-reference';
import getOne from './fixtures/get-one';
import create from './fixtures/create';
import update from './fixtures/update';
import getMany from './fixtures/get-many';

chai.use(chaiAsPromised);

const { expect } = chai;

const client = jsonapiClient('http://api.example.com', {
  total: 'total-count',
});

let result;

describe('GET_LIST', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get(/users.*sort=name.*/)
      .reply(200, getList);

    return client('GET_LIST', 'users', {
      pagination: { page: 1, perPage: 25 },
      sort: { field: 'name', order: 'ASC' },
    })
      .then((data) => { result = data; });
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
      .then((data) => { result = data; });
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

describe('GET_ONE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get('/users/1')
      .reply(200, getOne);

    return client('GET_ONE', 'users', { id: 1 })
      .then((data) => { result = data; });
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
});

describe('CREATE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .post('/users')
      .reply(201, create);

    return client('CREATE', 'users', { data: { name: 'Sarah' } })
      .then((data) => { result = data; });
  });

  it('returns an object', () => {
    expect(result).to.be.an('object');
  });

  it('has record ID', () => {
    expect(result.data).to.have.property('id').that.is.equal(6);
  });

  it('has records attributes', () => {
    expect(result.data).to.have.property('name').that.is.equal('Sarah');
  });
});

describe('UPDATE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .patch('/users/1')
      .reply(200, update);

    return client('UPDATE', 'users', { id: 1, data: { name: 'Tim' } })
      .then((data) => { result = data; });
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
      .then((data) => { result = data; });
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

describe('GET_MANY', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get(/users.*filter=.*/)
      .reply(200, getMany);

    return client('GET_MANY', 'users', { ids: [1] } )
      .then((data) => { result = data; });
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
    expect(result.data).to.deep.include({ id: 1, name: 'Bob' });
  });

  it('contains a total property', () => {
    expect(result).to.have.property('total').that.is.equal(1);
  });
});
