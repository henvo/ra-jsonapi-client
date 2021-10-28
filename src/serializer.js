/* eslint-disable max-len */
import isObject from './utils';

export default relationshipsMap => (type, { id, ...objectToSerialize }) => {
  const isRelationship = key => !!relationshipsMap[type]?.[key];

  return JSON.stringify({
    data: {
      type,
      id,
      ...Object.entries(objectToSerialize)
        .reduce((acum, [key, value]) => {
          if (isRelationship(key)) {
            if (Array.isArray(value)) {
              return {
                ...acum,
                relationships: {
                  ...(acum.relationships ?? {}),
                  [key]: {
                    data: value.map(val => ({
                      type: relationshipsMap[type][key],
                      id: isObject(val) ? val.id : val,
                    })),
                  },
                },
              };
            }

            return {
              ...acum,
              relationships: {
                ...(acum.relationships ?? {}),
                [key]: {
                  data: {
                    type: relationshipsMap[type][key],
                    id: isObject(value) ? value.id : value,
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
        }, {}),
    },
  });
};
