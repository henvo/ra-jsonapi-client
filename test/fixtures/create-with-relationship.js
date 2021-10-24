export default {
  links: {
    self: 'http://localhost:5000/projects',
  },
  data: {
    type: 'projects',
    id: '3',
    attributes: {
      name: 'Test project 666',
    },
    relationships: {
      owner: {
        links: {
          self: 'http://localhost:5000/projects/3/relationships/owner',
          related: 'http://localhost:5000/projects/3/owner',
        },
      },
      collaborators: {
        links: {
          self: 'http://localhost:5000/projects/3/relationships/collaborators',
          related: 'http://localhost:5000/projects/3/collaborators',
        },
      },
    },
    links: {
      self: 'http://localhost:5000/projects/3',
    },
  },
};
