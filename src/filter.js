import isObject from './utils';

export const makeFilter = ({ filter }) => filter?.raw;

export const makeReferenceFilter = ({ target, id }) => `equals(${target},'${id}')`;

export const combineFilters = (...filters) => {
  const [filter1, ...rest] = filters.filter(f => f?.length > 1);

  if (!filter1) {
    return undefined;
  }

  return rest.length ? `and(${filter1},${combineFilters(...rest)})` : filter1;
};
