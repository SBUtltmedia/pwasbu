//Changed this test
const routes = [
  {
    path: '/',
    getTemplate:  (params) => template.load('Login'),
  },{
    path: '/menu',
    getTemplate:  (params) => template.load('Menu'),
  },
  {
    path: '/blank',
    getTemplate:  (params) => template.load('Blank'),
  },
  {
    path: '/navbar',
    getTemplate:  (params) => template.load('Navbar'),
  },
  {
    path: '/contact',
    getTemplate: (params) => template.load('Contact'),
  },
  {
    path: '/editprofile',
    getTemplate: (params) => template.load('EditProfile'),
  },
  {
    path: '/products/:productId',
    getTemplate:  (params) => template.load('Product',params),
  },
];
