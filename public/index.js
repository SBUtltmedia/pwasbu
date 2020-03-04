    // Your web app's Firebase configuration
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
      


      'callbacks': {
        // Called when the user has been successfully signed in.
        'signInSuccessWithAuthResult': function(authResult, redirectUrl) {
          if (authResult.user) {
            handleSignedInUser(authResult);
          }
          
          // Do not redirect.
          return false;
        }
      },

      



      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
        
      ]
    };
    
    // Initialize the FirebaseUI widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
    
    var fs= firebase.firestore()
    fs.enablePersistence().then(init);


function handleSignedInUser(authResult){
  console.log(authResult)
  document.getElementById('firebaseui-auth-container').style.display = 'none';
  document.getElementById('signed-in').style.display = 'block';
}

function init(){
  var docRef = fs.collection("users")
  var data = docRef.get().then((docs)=>{docs.forEach((doc)=>console.log(doc.data()))})

}

document.addEventListener("DOMContentLoaded", function(){
  console.log("f")
  
  
      const selectElement = document.querySelector('.ice-cream');
  
      selectElement.addEventListener('change', (event) => {
        const result = document.querySelector('.result');
        result.textContent = `You like ${event.target.value}`;
        console.log(event)
        var payload= {
          first: event.target.value,
          last: "Lovelace",
          born: 1815
        }
        
        saveData(payload)
  
  
  
      });
  
  
  
  
      // document.getElementById("name").addEventListener("change",(evt)=>{
  
     
     
      // })
         });
function saveData(payload,key="users"){
  fs.collection(key).add(payload)
.then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
})
.catch(function(error) {
    console.error("Error adding document: ", error);
});


  function writeUserData(userId, name, email, imageUrl) {
firebase.database().ref('users/' + userId).set({
  username: name,
  email: email,
  profile_picture : imageUrl
});
}

}

// 
if('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('sw.js')
           .then(function() { console.log('Service Worker Registered'); });
}

// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
// addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });
});
