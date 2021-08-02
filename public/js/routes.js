//Changed this test
class RoutesObj { 
  constructor(template) {
    this.template = template;
    this.routes = [
      {
        path: '/',
        getTemplate:  (params) => this.template.load('Login'),
      },
      {
        path: '/home',
        getTemplate:  (params) => this.template.load('Home'),
      },
      {
        path: '/userDetails',
        getTemplate:  (params) => this.template.load('UserDetails'),
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
        path: '/evaluation',
        getTemplate:  (params) => this.template.load('Evaluation'),
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
        path: '/accountSettings',
        getTemplate: (params) => this.template.load('AccountSettings'),
      },
      {
        path: '/controlpanel',
        getTemplate: (params) => this.template.load('ControlPanel'),
      }
    ];
  }
}

