export default {
  data: {
    type: 'user',
    id: 1,
    attributes: {
      name: 'Bob',
    },
    relationships: {
      cars: {
        'links': {
          'related': '/users/1/cars',
        },
      }
    }
  }
};
