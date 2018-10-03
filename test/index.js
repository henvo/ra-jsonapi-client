import { expect } from 'chai';
import nock from 'nock';

import jsonapiClient from '../src/index';
import getList from './fixtures/get_list';
import getOne from './fixtures/get_one';

const client = jsonapiClient('http://api.example.com');
let result;

describe('GET_LIST', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get(/users/)
      .reply(200, JSON.stringify(getList));

    return client('GET_LIST', 'users', {
      pagination: { page: 1, perPage: 25 },
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
});

describe('GET_ONE', () => {
  beforeEach(() => {
    nock('http://api.example.com')
      .get('/users/1')
      .reply(200, JSON.stringify(getOne));

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
});

describe('UPDATE', () => {
});

describe('DELETE', () => {
});
