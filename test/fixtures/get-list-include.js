export default {
  links: {
    self: 'http://localhost:5000/projects?include=collaborators,owner',
    first: 'http://localhost:5000/projects?include=collaborators,owner',
  },
  data: [
    {
      type: 'projects',
      id: '2',
      attributes: {
        name: 'Test project 1',
      },
      relationships: {
        owner: {
          links: {
            self: 'http://localhost:5000/projects/2/relationships/owner',
            related: 'http://localhost:5000/projects/2/owner',
          },
          data: {
            type: 'users',
            id: '3',
          },
        },
        collaborators: {
          links: {
            self: 'http://localhost:5000/projects/2/relationships/collaborators',
            related: 'http://localhost:5000/projects/2/collaborators',
          },
          data: [
            {
              type: 'users',
              id: '6',
            },
          ],
        },
      },
      links: {
        self: 'http://localhost:5000/projects/2',
      },
    },
  ],
  included: [
    {
      type: 'users',
      id: '3',
      attributes: {
        firstName: null,
        lastName: null,
        email: 'xmr.nkr@gmail.com',
      },
      relationships: {
        projects: {
          links: {
            self: 'http://localhost:5000/users/3/relationships/projects',
            related: 'http://localhost:5000/users/3/projects',
          },
        },
      },
      links: {
        self: 'http://localhost:5000/users/3',
      },
    },
    {
      type: 'users',
      id: '6',
      attributes: {
        firstName: null,
        lastName: null,
        email: 'joselito@mailinator.com',
      },
      relationships: {
        projects: {
          links: {
            self: 'http://localhost:5000/users/6/relationships/projects',
            related: 'http://localhost:5000/users/6/projects',
          },
        },
      },
      links: {
        self: 'http://localhost:5000/users/6',
      },
    },
  ],
};
