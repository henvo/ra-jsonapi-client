import isObject from './utils';

export const parseIdsFilter = ({ ids }) => (ids.length > 1 ? `any(id,${ids.reduce((acum, cur) => `${acum.length ? `${acum},` : ''}'${isObject(cur) ? cur.id : cur}'`, '')})` : `eq(id,${isObject(ids[0]) ? ids[0].id : ids[0]})`);

export const makeFilter = ({ filter }) => filter?.raw;

export const makeReferenceFilter = ({ target, id }) => `eq(${target},'${id}')`;

export const combineFilters = (...filters) => {
  const [filter1, ...rest] = filters.filter(f => f?.length > 1);

  if (!filter1) {
    return undefined;
  }

  return rest.length ? `and(${filter1},${combineFilters(...rest)})` : filter1;
};
