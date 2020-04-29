//Changed this test
const routes = [
  {
    path: '/',
    getTemplate:  (params) => template.load('Login'),
  },{
    path: '/home',
    getTemplate:  (params) => template.load('Home'),
  },{
    path: '/editusers',
    getTemplate:  (params) => template.load('EditUsers'),
  },
  {
    path: '/forgotpassword',
    getTemplate:  (params) => template.load('ForgotPassword'),
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
    path: '/missinginfo',
    getTemplate: (params) => template.load('MissingInfo'),
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
    path: '/editcampers',
    getTemplate: (params) => template.load('EditCampers'),
  },{
    path: '/editactivities',
    getTemplate: (params) => template.load('EditActivities'),
  },
  {
    path: '/products/:productId',
    getTemplate:  (params) => template.load('Product',params),
  },
];
