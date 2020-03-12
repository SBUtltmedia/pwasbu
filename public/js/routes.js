const routes = [
  {
    path: '/',
    getTemplate:  (params) => template.load('Home'),
  },
  {
    path: '/about',
    getTemplate:  (params) => template.load('About'),
  },
  {
    path: '/contact',
    getTemplate: (params) => template.load('Contact'),
  },
  {
    path: '/products/:productId',
    getTemplate:  (params) => template.load('Product',params),
  },
];
