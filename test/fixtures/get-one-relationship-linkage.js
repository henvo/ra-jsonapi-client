export default {
  data: {
    type: 'user',
    id: 1,
    attributes: {
      name: 'Bob',
    },
    relationships: {
      address: {
        data: { type: 'address', id: '9' }
      }
    }
  }
};
