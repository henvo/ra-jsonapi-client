export default {
  data: {
    type: 'user',
    id: 1,
    attributes: {
      name: 'Bob',
    },
    relationships: {
      address: {
        data: { type: 'address', id: '2' }
      }
    }
  },
  included: [
    {
      type: 'address',
      id: '2',
      attributes: {
        street: 'Pinchelone Street',
        number: 2475,
        city: 'Norfolk',
        state: 'VA'
      }
    }
  ]
};
