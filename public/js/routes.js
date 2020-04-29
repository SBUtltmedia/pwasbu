//Changed this test
class RoutesObj { 
  constructor(template) {
    this.template = template;
    this.routes = [
      {
        path: '/',
        getTemplate:  (params) => this.template.load('Login'),
      },{
        path: '/home',
        getTemplate:  (params) => this.template.load('Home'),
      },{
        path: '/editusers',
        getTemplate:  (params) => this.template.load('EditUsers'),
      },
      {
        path: '/forgotpassword',
        getTemplate:  (params) => this.template.load('ForgotPassword'),
      },
      {
        path: '/blank',
        getTemplate:  (params) => this.template.load('Blank'),
      },
      {
        path: '/navbar',
        getTemplate:  (params) => this.template.load('Navbar'),
      },
      {
        path: '/missinginfo',
        getTemplate: (params) => this.template.load('MissingInfo'),
      },
      {
        path: '/contact',
        getTemplate: (params) => this.template.load('Contact'),
      },
      {
        path: '/editprofile',
        getTemplate: (params) => this.template.load('EditProfile'),
      },
      {
        path: '/editcampers',
        getTemplate: (params) => this.template.load('EditCampers'),
      },{
        path: '/editactivities',
        getTemplate: (params) => this.template.load('EditActivities'),
      },
      {
        path: '/products/:productId',
        getTemplate:  (params) => this.template.load('Product',params),
      },
    ];
  }
}

