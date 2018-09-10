import { stringify } from 'query-string';
import { fetch } from 'isomorphic-fetch';
import {
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  DELETE,
  GET_MANY,
  GET_MANY_REFERENCE,
} from './actions';

/**
 * Maps react-admin queries to my REST API
 *
 * @param {string} type Request type, e.g GET_LIST
 * @param {string} resource Resource name, e.g. "posts"
 * @param {Object} payload Request parameters. Depends on the request type
 * @returns {Promise} the Promise for a data response
 */
export default apiUrl => (type, resource, params) => {
  let url = '';

  const options = {
    headers: {
      Accept: 'application/vnd.api+json; charset=utf-8',
      'Content-Type': 'application/vnd.api+json; charset=utf-8',
    },
  };

  switch (type) {
    case GET_LIST: {
      const { page, perPage } = params.pagination;
      // TODO: Allow sorting, filtering etc.
      const query = {
        'page[number]': page,
        'page[size]': perPage,
      };
      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    case GET_ONE:
      url = `${apiUrl}/${resource}/${params.id}`;
      break;

    case CREATE:
      url = `${apiUrl}/${resource}`;
      options.method = 'POST';
      options.body = JSON.stringify({
        data: { type: resource, attributes: params.data },
      });
      break;

    case UPDATE: {
      url = `${apiUrl}/${resource}/${params.id}`;

      const body = {
        data: {
          id: params.id,
          type: resource,
          attributes: params.data,
        },
      };

      options.method = 'PUT';
      options.body = JSON.stringify(body);
      break;
    }

    case DELETE:
      url = `${apiUrl}/${resource}/${params.id}`;
      options.method = 'DELETE';
      break;

    case GET_MANY: {
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    case GET_MANY_REFERENCE: {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = {
        sort: JSON.stringify([field, order]),
        page: JSON.stringify({ size: perPage, number: page }),
        filter: JSON.stringify({
          ...params.filter,
          [params.target]: params.id,
        }),
      };
      url = `${apiUrl}/${resource}?${stringify(query)}`;
      break;
    }

    default:
      throw new Error(`Unsupported Data Provider request type ${type}`);
  }

  return fetch(url, options)
    .then(res => res.json())
    .then((json) => {
      switch (type) {
        case GET_LIST: {
          return {
            data: json.data.map(value => Object.assign(
              { id: value.id },
              value.attributes,
            )),
            // TODO: This is not spec'd by JSON API.
            // Should be read from some kind of config.
            total: json.meta.total,
          };
        }

        case GET_ONE: {
          const { data } = json;
          const { id } = data;

          return { data: Object.assign({ id }, data.attributes) };
        }

        case CREATE: {
          const { data } = json;
          const { id } = data;

          return { data: Object.assign({ id }, data.attributes) };
        }

        case UPDATE: {
          const { data } = json;
          const { id } = data;

          return { data: Object.assign({ id }, data.attributes) };
        }

        default:
          throw new Error(`Unsupported Data Provider request type ${type}`);
      }
    });
};
