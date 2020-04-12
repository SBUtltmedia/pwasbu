// Your web app's Firebase configuration
const router = new Router(routes);
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

let provider = new firebase.auth.GoogleAuthProvider();
var uiConfig = {
    'callbacks': {
        // Called when the user has been successfully signed in.
        'signInSuccessWithAuthResult': function (authResult, redirectUrl) {
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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("logged in", user);
        router.loadRoute('menu');
    } else {
        console.log("logged out", user);
        router.loadRoute('');
    }
});

var fs = firebase.firestore()
fs.enablePersistence()
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            alert("More than 1 tab is open for this app. Only one of the apps can be accessed offline at a time!");
        } else if (err.code == 'unimplemented') {
            document.getElementById("app-warning").innerHTML = "The browser that you are using does not support offline";
        }
    });

function handleSignedInUser(authResult) {
    console.log(authResult)
    // document.getElementById('firebaseui-auth-container').style.display = 'none';
    document.getElementById('signed-in').style.display = 'block';
}

function init() {
    var docRef = fs.collection("users")
    var data = docRef.get().then(loopOverDocs)

}

function loopOverDocs(docs){
docs.forEach(loopOverKeys)
}

function loopOverKeys(doc){

  Object.keys(doc).forEach(key=>{

  var newDiv = document.createElement('div')
  newDiv.setAttribute('id',key);
  document.body.appendChild(newDiv);
})

}

document.addEventListener("DOMContentLoaded", function () {



    // const selectElement = document.querySelector('.ice-cream');
    //
    // selectElement.addEventListener('change', (event) => {
    //     const result = document.querySelector('.result');
    //     result.textContent = `You like ${event.target.value}`;
    //     console.log(event)
    //     var payload = {
    //         first: event.target.value,
    //         last: "Lovelace",
    //         born: 1815
    //     }
    //
    //     saveData(payload)
    // });
    // document.getElementById("name").addEventListener("change",(evt)=>{



    // })
});
function saveUserData(payload, key = "users") {
    fs.collection(key).add(payload)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

    // Not using real time database for this setup
    // function writeUserData(userId, name, email, imageUrl) {
    //     firebase.database().ref('users/' + userId).set({
    //         username: name,
    //         email: email,
    //         profile_picture: imageUrl
    //     });
    // }

}

// Disabling the service worker for now
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//         .register('sw.js')
//         .then(function () { console.log('Service Worker Registered'); });
// }

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
/***
 * Firebase auth Functions
 */
function getUserInfo() {
    let user = firebase.auth().currentUser;
    if (user != null) {
        return {email: user.email, name: user.displayName};
    } else {
        return {email: "error loading user", name: "error loading user"};
    }
}

function signIn(email, password){
    console.log("Attempting to sign in");
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function() {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    console.log("Attempting to load menu");
                    router.loadRoute('menu');
                })
                .catch(function (error) {
                    $(".btn").show();
                    $(".loader").hide();
                    document.getElementById("login_error").innerHTML = error.message;
                    $("#login_error").show();
                });
        })
        .catch(function(error) {
            $(".btn").show();
            $(".loader").hide();
            document.getElementById("login_error").innerHTML = error.message;
            $("#login_error").show();
        });
}

function login() {
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-pass").value;
    if(!emailIsValid(email)){
        document.getElementById("login_error").innerHTML = "Email field is invalid!"
        $("#login_error").show();
    } else {
        $(".btn").hide();
        $(".loader").show();
        signIn(email, password);
    }
}

function signup() {
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-pass").value;
    let name = document.getElementById("signup-user").value;
    if(!emailIsValid(email)){
        document.getElementById("pass_error").innerHTML = "Email field is invalid!"
        $("#pass_error").show();
    } else if(name.length <= 0) {
        document.getElementById("pass_error").innerHTML = "Name field is empty!"
        $("#pass_error").show();
    } else if(!passIsValid(password)) {
        document.getElementById("pass_error").innerHTML = "Password field is invalid!"
        $("#pass_error").show();
    } else {
        $(".btn").hide();
        $(".loader").show();
        console.log("User signup sucessful!");
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                console.log("Attempting to register user into DB");
                db.collection("user").add(generateUser(email, name)).then(function(docRef){
                    console.log("Added User info for " + email + " successfully with ID : " + docRef.id);
                }).catch(function(err){
                    console.log(err.message);
                });
                firebase.auth().currentUser.updateProfile({
                    displayName: name,
                }).then(function() {
                    console.log("Updated user display name successfully!");
                    signIn(email, password);
                }).catch(function(error) {
                    console.log(error.message);
                    signIn(email, password);
                });
            })
            .catch(function (error) {
                $(".btn").show();
                $(".loader").hide();
                document.getElementById("pass_error").innerHTML = error.message;
                $("#pass_error").show();
            });
    }
}
function signout() {
    console.log("Attempting to signout");
    firebase.auth().signOut().then(function() {
        //loadLogin();
        console.log("User has signed out successfully");
    }).catch(function(error) {
        //loadLogin();
        console.log(error.message + " with error code : " + error.code);
    });
}
function googleSignIn(){
    $(".btn").hide();
    $(".loader").show();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        let token = result.credential.accessToken;
        // The signed-in user info.
        let user = result.user;
        // Not using all of the fields above yet
        router.loadRoute('menu');
    }).catch(function(error) {
        $(".btn").show();
        $(".loader").hide();
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        // The email of the user's account used.
        let email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        let credential = error.credential;
        // Not using all of the fields yet
        document.getElementById("pass_error").innerHTML = errorMessage;
        $("#pass_error").show();
    });
}