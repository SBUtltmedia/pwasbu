var firebaseConfig = {
    apiKey: "AIzaSyApt83e-9UQl2qm0pWT_qTLHttcJvxVHhk",
    authDomain: "pwasbu.firebaseapp.com",
    databaseURL: "https://pwasbu.firebaseio.com",
    projectId: "pwasbu",
    storageBucket: "pwasbu.appspot.com",
    messagingSenderId: "50350195533",
    appId: "1:50350195533:web:6447aabeb5639f634fed04",
    measurementId: "G-QLBTF51T0Y"
  };
//     const firebase = require("firebase");
// // Required for side-effects
// require("firebase/firestore");
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var uiConfig = {
signInSuccessUrl: 'pwa.html',
signInOptions: [
  firebase.auth.GoogleAuthProvider.PROVIDER_ID
  
]
};

// Initialize the FirebaseUI widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);