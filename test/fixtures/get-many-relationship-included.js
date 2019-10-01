export default {
  data: [
    {
      type: 'user',
      id: 1,
      attributes: { name: 'Bob' },
      relationships: {
        address: {
          data: { type: 'address', id: '9' }
        }
      }
    },
  ],
  meta: {
    'total-count': 1,
  },
  included: [
    {
      type: 'address',
      id: '9',
      attributes: {
        street: 'Pinchelone Street',
        number: 2475,
        city: 'Norfolk',
        state: 'VA'
      }
    }
  ]
};
