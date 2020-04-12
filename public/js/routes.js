const routes = [
  {
    path: '/',
    getTemplate:  (params) => template.load('Login'),
  },
  {
    path: '/menu',
    getTemplate:  (params) => template.load('Menu'),
  },
  {
    path: '/contact',
    getTemplate: (params) => template.load('Contact'),
  },
  {
    path: '/usersettings',
    getTemplate: (params) => template.load('UserSettings'),
  },
  {
    path: '/products/:productId',
    getTemplate:  (params) => template.load('Product',params),
  },
];
