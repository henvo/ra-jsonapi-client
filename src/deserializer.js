/* eslint-disable max-len */
export default ({ data, included }, total) => {
  const includedMap = new Map(included?.map(resource => [`${resource.type}-${resource.id}`, resource.attributes]) ?? []);

  const deserializeSingleRelationship = ({ id, type }) => ({
    id,
    ...includedMap.get(`${type}-${id}`),
  });

  const deserializeRelationships = relationships => Object.keys(relationships ?? {}).reduce((acum, cur) => (
    relationships[cur].data
      ? {
        ...acum,
        [cur]: Array.isArray(relationships[cur].data)
          ? relationships[cur].data.map(deserializeSingleRelationship)
          : deserializeSingleRelationship(relationships[cur].data),
      }
      : acum), {});

  const deserializeSingle = ({ id, attributes, relationships }) => ({
    id,
    ...attributes,
    ...deserializeRelationships(relationships),
  });

  return {
    data: Array.isArray(data)
      ? data.map(deserializeSingle)
      : deserializeSingle(data),
    total,
  };
};
