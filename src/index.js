import {stringify} from 'qs';
import merge from 'deepmerge';
import axios from 'axios';
import {
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE,
  GET_MANY,
  GET_MANY_REFERENCE
} from './actions';

import defaultSettings from './default-settings';
import {NotImplementedError} from './errors';
import ResourceLookup from './resourceLookup';
import init from './initializer';

// Set HTTP interceptors.
init();

/**
 * Maps react-admin queries to a JSONAPI REST API
 *
 * @param {string} apiUrl the base URL for the JSONAPI
 * @param {string} userSettings Settings to configure this client.
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */
export default (apiUrl, userSettings = {}) => (type, resource, params) => {
  let url = '';
  const settings = merge(defaultSettings, userSettings);

  const options = {
    headers: settings.headers
  };

  switch (type) {
    case GET_LIST: {
      const { page, perPage } = params.pagination;

      // Create query with pagination params.
      const query = {
        'page[number]': page,
        'page[size]': perPage
      };

      // Add all filter params to query.
      Object.keys(params.filter || {}).forEach((key) => {
        query[`filter[${key}]`] = params.filter[key];
      });

      // Add sort parameter
      if (params.sort && params.sort.field) {
        const prefix = params.sort.order === 'ASC' ? '' : '-';
        query.sort = `${prefix}${params.sort.field}`;
      }

      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    case GET_ONE:
      url = `${apiUrl}/${resource}/${params.id}`;
      break;

    case CREATE:
      url = `${apiUrl}/${resource}`;
      options.method = 'POST';
      options.data = JSON.stringify({
        data: { type: resource, attributes: params.data }
      });
      break;

    case UPDATE: {
      url = `${apiUrl}/${resource}/${params.id}`;

      const data = {
        data: {
          id: params.id,
          type: resource,
          attributes: params.data
        }
      };

      options.method = settings.updateMethod;
      options.data = JSON.stringify(data);
      break;
    }

    case DELETE:
      url = `${apiUrl}/${resource}/${params.id}`;
      options.method = 'DELETE';
      break;

    case GET_MANY: {
      const query = {
        filter: JSON.stringify({ id: params.ids })
      };
      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    case GET_MANY_REFERENCE: {
      const { page, perPage } = params.pagination;

      // Create query with pagination params.
      const query = {
        'page[number]': page,
        'page[size]': perPage
      };

      // Add all filter params to query.
      Object.keys(params.filter || {}).forEach((key) => {
        query[`filter[${key}]`] = params.filter[key];
      });

      // Add the reference id to the filter params.
      query[`filter[${params.target}]`] = params.id;

      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    default:
      throw new NotImplementedError(`Unsupported Data Provider request type ${type}`);
  }

  return axios({ url, ...options })
    .then((response) => {
      const lookup = new ResourceLookup(response.data);

      switch (type) {
        case GET_MANY:
        case GET_MANY_REFERENCE:
        case GET_LIST:
          return {
            data: response.data.data.map(resource => lookup.unwrapData(resource)),
            total: response.data.meta[settings.total]
          };

        case GET_ONE:
        case CREATE:
        case UPDATE:
          return {
            data: lookup.unwrapData(response.data.data)
          };

        case DELETE: {
          return {
            data: { id: params.id }
          };
        }

        default:
          throw new NotImplementedError(`Unsupported Data Provider request type ${type}`);
      }
    });
};
