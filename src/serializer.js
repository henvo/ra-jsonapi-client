/* eslint-disable max-len */
const isObject = object => JSON.stringify(object).startsWith('{');

const splitAttributesAndRelationships = (type, objectToSerialize, relationshipsMap) => Object.entries(objectToSerialize)
  .reduce((acum, [key, value]) => {
    if (Array.isArray(value)) {
      return {
        ...acum,
        relationships: {
          ...(acum.relationships ?? {}),
          [key]: {
            data: value.map(val => ({
              type: relationshipsMap[type][key],
              id: val.id,
            })),
          },
        },
      };
    }

    if (isObject(value)) {
      return {
        ...acum,
        relationships: {
          ...(acum.relationships ?? {}),
          [key]: {
            data: {
              type: relationshipsMap[type][key],
              id: value.id,
            },
          },
        },
      };
    }

    return {
      ...acum,
      attributes: {
        ...(acum.attributes ?? {}),
        [key]: value,
      },
    };
  }, {});

export default relationshipsMap => (type, { id, ...objectToSerialize }) => JSON.stringify({
  data: {
    type,
    id,
    ...splitAttributesAndRelationships(type, objectToSerialize, relationshipsMap),
  },
});
