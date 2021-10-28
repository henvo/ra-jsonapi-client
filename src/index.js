import { stringify } from 'qs';
import merge from 'deepmerge';
import axios from 'axios';
import {
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE,
  GET_MANY,
  GET_MANY_REFERENCE,
} from './actions';
import deserialize from './deserializer';
import makeSerializer from './serializer';
import defaultSettings from './default-settings';
import { NotImplementedError } from './errors';
import init from './initializer';

// Set HTTP interceptors.
init();

/**
 * Maps react-admin queries to a JSONAPI REST API
 *
 * @param {string} apiUrl the base URL for the JSONAPI
 * @param {Object} userSettings Settings to configure this client.
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */
export default (apiUrl, userSettings = {}) => (type, resource, params) => {
  let url = '';
  const settings = merge(defaultSettings, userSettings);

  const serialize = makeSerializer(settings.relationshipsMap);

  const options = {
    headers: settings.headers,
  };

  const include = Object.keys(settings.relationshipsMap?.[resource] ?? {}).join(',');

  const query = {
    include: include !== '' ? include : undefined,
  };

  switch (type) {
    case GET_LIST:
    case GET_MANY_REFERENCE:
      // Create query with pagination params and include declared relationships.
      query['page[number]'] = params.pagination.page;
      query['page[size]'] = params.pagination.perPage;

      // https://www.jsonapi.net/usage/reading/filtering.html
      // Send an object containing a JSON API compliant query in its raw property
      query.filter = params.filter.raw;

      if (type === GET_MANY_REFERENCE) {
        // Add the reference id to the filter params.
        const referenceFilter = `eq(${params.target},'${params.id}')`;
        query.filter = query.filter?.length ? `and(${query.filter},${referenceFilter})` : referenceFilter;
      }

      // Add sort parameter
      if (params.sort && params.sort.field) {
        const prefix = params.sort.order === 'ASC' ? '' : '-';
        query.sort = `${prefix}${params.sort.field}`;
      }

      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;

    case GET_ONE: {
      const queryString = stringify(query);
      url = `${apiUrl}/${resource}/${params.id}${queryString !== '' ? `?${queryString}` : ''}`;
      break;
    }

    case CREATE:
      url = `${apiUrl}/${resource}`;
      options.method = 'POST';
      options.data = serialize(resource, params.data);
      break;

    case UPDATE: {
      url = `${apiUrl}/${resource}/${params.id}`;
      options.method = settings.updateMethod;
      options.data = serialize(resource, params.data);
      break;
    }

    case DELETE:
      url = `${apiUrl}/${resource}/${params.id}`;
      options.method = 'DELETE';
      break;

    case GET_MANY: {
      query.filter = params.ids.length > 1 ? `any(id,${params.ids.reduce((acum, cur) => `${acum.length ? `${acum},` : ''}'${cur}'`, '')})` : `eq(id,${params.ids[0]})`;

      url = `${apiUrl}/${resource}?${stringify(query, { arrayFormat: settings.arrayFormat })}`;
      break;
    }

    default:
      throw new NotImplementedError(`Unsupported Data Provider request type ${type}`);
  }

  return axios({ url, ...options })
    .then((response) => {
      let total;

      // For all collection requests get the total count.
      if ([GET_LIST, GET_MANY, GET_MANY_REFERENCE].includes(type)) {
        // When meta data and the 'total' setting is provided try
        // to get the total count.
        if (response.data.meta && settings.total) {
          total = response.data.meta[settings.total];
        }

        // Use the length of the data array as a fallback.
        total = total || response.data.data.length;
      }

      switch (type) {
        case GET_MANY:
        case GET_LIST:
        case GET_MANY_REFERENCE:
        case GET_ONE:
        case CREATE:
        case UPDATE:
          return deserialize(response.data, total);

        case DELETE: {
          return {
            data: { id: params.id },
          };
        }

        default:
          throw new NotImplementedError(`Unsupported Data Provider request type ${type}`);
      }
    });
};
