let clearProfilePictures = (email, callback) => {
    listRef = storageRef.child(`users/${email}/profile-picture/`);    
    listRef.listAll().then(function(res) {
        res.items.forEach(function(itemRef) {
          itemRef.delete().then(()=>{console.log("deleted " + itemRef);})
          .catch((err)=>{console.log(err)});})
          .then(() => {callback();});
      }).catch(function(error) {
        console.log(error);
        callback();
      });
};

function updateProfile(){
    firstName = document.getElementById("user-first-name").value;
    lastName = document.getElementById("user-last-name").value;
    gender = document.getElementById("user-gender").value;
    if(firstName.length <= 0 || firstName == null) {
        $("#profile-success").hide();
        $("#profile-error").show();
    } else if(lastName.length <= 0 || lastName == null) {
        $("#profile-success").hide();
        $("#profile-error").show();
    } else if(gender.length <= 0 || gender == null) {
        $("#profile-success").hide();
        $("#profile-error").show();
    } else {
        $("#profile-error").hide();
        birthdate = document.getElementById("birthdate").value;
        userPayload = JSON.parse(localStorage.getItem("userData"));
        try{
            userPayload['firstName'] = firstName;
            userPayload['lastName'] = lastName;
            userPayload['gender'] = gender;
            userPayload['birthdate'] = birthdate;
            setUser(userPayload['email'], userPayload);
            console.log("The data has been updated to :" + JSON.stringify(userPayload));   
            localStorage.setItem("userData", JSON.stringify(userPayload));
        } catch(error) {
            let user = firebase.auth().currentUser;
            userPayload = JSON.parse(localStorage.getItem("userData"));
            setUser(user.email, generateUser(user.email, userPayload['firstName'], userPayload['lastName'], userPayload['gender'], userPayload['priv']));
        }
        try {
            updateProfilePicture();
        } catch(error) {
            console.log("Profile picture not updated: ", error);
            $("#profile-success").show();
        }
    }
}

// function updateProfile() {
//     name = document.getElementById("user-name").value;
//     email = document.getElementById("user-email").value;
//     gender = document.getElementById("user-gender").value;
//     if(name.length <= 0 || name == null) {
//         $("#profile-success").hide();
//         $("#profile-error").show();
//     } 
//     else if(email.length <= 0 || email == null) {
//         $("#profile-success").hide();
//         $("#profile-error").show();
//     }
//     else if(gender.length <= 0 || gender == null) {
//         $("#profile-success").hide();
//         $("#profile-error").show();
//     } else {
//         $("#profile-error").hide();
//         birthdate = document.getElementById("birthdate").value;
//         userPayload = JSON.parse(localStorage.getItem("userData"));
//         original_email = userPayload['email'];
//         try {   
//             userPayload['firstName'] = name;
//             userPayload['email'] = email;
//             userPayload['gender'] = gender;
//             userPayload['birthdate'] = birthdate;
//             console.log("The data has been updated to :" + JSON.stringify(userPayload));   
//             if(setUser(original_email, userPayload)) {
//                 console.log("TEST TRUE");
//                 localStorage.setItem("userData", JSON.stringify(userPayload));
//                 console.log("User profile updated successfully");
//                 $("#profile-success").show();
//             }
//             try {
//                 updateProfilePicture();
//             } catch(error) {
//                 console.log("Profile picture not updated");
//                 console.log(error);
//             }
//         } catch(error) {
//             let user = firebase.auth().currentUser;
//             setUser(user.email, generateUser(user.email, name));
//         }
//     }
// }

function updateProfilePicture() {
    let user = firebase.auth().currentUser;
    let file = document.getElementById("cameraInput").files[0];
    console.log(file);
    clearProfilePictures(user.email,
        storageRef.child(`users/${user.email}/profile-picture/` + file.name).put(file)
            .then(() => {
                console.log("Successfully updated profile picture");
                $("#profile-success").show();
            }).catch((err) => {
                console.log(err);
            }));
}

let loadProfilePicture = () => {
    let user = firebase.auth().currentUser;
    let listRef = storageRef.child(encodeURI(`users/${user.email}/profile-picture`));
    console.log("Trying to get a file from " + user.email );
    listRef.listAll().then(function(res) {
        let profilePic = res.items[0];
        storageRef.child(encodeURI(`users/${user.email}/profile-picture/${profilePic.name}`)).getDownloadURL().then(function(url) {
            console.log("Loading " + url + " as profile image");
            document.getElementById("profile-pic").src = url;
        }).catch(function(error) {
            console.log(error);
            document.getElementById("profile-pic").src = '../img/user/default/user-480.png';
        });
      }).catch(function(error) {
        console.log(error);
        console.log("List all failed to work");
        document.getElementById("profile-pic").src = '../img/user/default/user-480.png';
      });
      try{
          document.getElementById("cameraInput").value = "";
      } catch(err) {
          
      }
};

let initEditProfile = () => {
    $(".loader").hide();
    $("#profile-error").hide();
    $("#profile-success").hide();
    birthdateField = document.getElementById("birthdate");
    birthdateField.max = new Date().toDateInputValue();
    userData = JSON.parse(localStorage.getItem("userData"));
    console.log(userData['gender']);
    birthdateField.value = userData['birthdate'];
    document.getElementById("user-first-name").value = userData['firstName'];
    document.getElementById("user-last-name").value = userData['lastName'];
    document.getElementById("user-gender").value = userData['gender'];
    loadProfilePicture();
};

let initAccountSettings = () => {
    $(".loader").hide();
    $("#profile-error").hide();
    $("#profile-success").hide();
    userData = JSON.parse(localStorage.getItem("userData"));
    document.getElementById("user-email").value = userData['email'];
};

function updateEmail() {
    $('#profile-success').hide();
    new_email = document.getElementById("user-email").value;
    password = document.getElementById("user-password").value;
    if(new_email.length <= 0 || new_email == null) {
        $("#profile-success").hide();
        $("#profile-error").show();
    }
    else if(password.length <= 0 || password == null) {
        $("#profile-success").hide();
        $("#profile-error").show();
    } else {
        $("#profile-error").hide();
        payload = JSON.parse(localStorage.getItem("userData"));
        payload['email'] = new_email;
        var user = firebase.auth().currentUser;
        original_email = user.email;
        if(original_email != new_email) {
            var credential = firebase.auth.EmailAuthProvider.credential(original_email, password);
            user.reauthenticateWithCredential(credential).then(function() {
                // Changing account email address
                user.updateEmail(new_email).then(function() {
                    console.log("Updated user login email successfully");
                    // Updating email in users collection
                    updateUsersCollectionEmail(original_email, new_email, payload);
                    // Changing directory path of profile pic
                    updateProfilePicDirectoryPath(original_email, new_email);
                }).catch(function(error) {
                    $("#profile-success").hide();
                    window.alert("Could not update account email: The new email address is already being used by another account");
                });
            }).catch(function(error) {
                $("#profile-success").hide();
                window.alert("Could not update account email: Incorrect credentials provided");
            });
        } else {
            window.alert("New email is the same as the old email");
        }
    }
}

function updateUsersCollectionEmail(original_email, new_email, payload) {
    fs.collection("users").where('email', '==', original_email).get().then( res => {
        let batch = fs.batch();
        res.forEach(doc => {
            batch.update(doc.ref, "email", new_email);
        });
        batch.commit().then(() => {
            localStorage.setItem("userData", JSON.stringify(payload));
            console.log("Users collection updated successfully");
        }).catch(err => {
            console.log("Could not update users collection successfully: ", err);
        });
    });
}

function updateProfilePicDirectoryPath(original_email, new_email) {
    let listRef = storageRef.child(encodeURI(`users/${original_email}/profile-picture`));
    console.log("Trying to get a file from " + original_email);
    listRef.listAll().then(function(res) {
        let profilePic = res.items[0];
        // Getting download URL of profil pic
        storageRef.child(encodeURI(`users/${original_email}/profile-picture/${profilePic.name}`)).getDownloadURL().then(function(url) {
            console.log("Loading " + url + " as profile image of new account email: " + new_email);
            // Getting profile pic from download link
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function(event) {
                var blob = xhr.response;
                // Adding profile pic to new directory path
                storageRef.child(`users/${new_email}/profile-picture/` + profilePic.name).put(blob)
                    .then(() => {
                        // Deleting profile pic from old directory path
                        res.items.forEach(function(itemRef) {
                            itemRef.delete().then(() => {
                                console.log("deleted " + itemRef);
                            }).catch((err) => {
                                console.log("Could not delete item: ", err);
                            });
                        }).then(() => {
                            console.log("Finished deleting images under old directory path");
                            $("#profile-success").show();
                        }).catch(() => {
                            console.log("Finished deleting images under old directory path");
                            $("#profile-success").show();
                        });
                    })
                    .catch((err) => {
                        console.log("Could not set profile pic of new email: ", err);
                        $("#profile-success").show();
                    });
            };
            xhr.open('GET', "https://cors-anywhere.herokuapp.com/" + url);
            xhr.send();
        }).catch((err) => {
            console.log("Could not set profile pic of new email: ", err);
        });
    }).catch(function(error) {
        console.log("No profile pic found from old directory path: ", error);
        $("#profile-success").show();
    });
}

let changePassword = () => {
    $('#profile-success').hide();
    userData = JSON.parse(localStorage.getItem("userData"));
    if(window.confirm("Are you sure you want to change your password?" +
        " If you select OK an email will be sent to " + userData['email'] + 
        " with a link to change the password for this account.")) {
        firebase.auth().sendPasswordResetEmail(userData['email']).then(() => {
            window.alert("Email sent successfully to " + userData['email']);
        }).catch(err => {
            console.log(err);
            window.alert("Could not send password change email to " + userData['email']);
        })
    } else {
        console.log("Password change cancelled");
    }
}

let validString = id => {
    $("#profile-success").hide();
    field = document.getElementById(id);
    textInput = field.value;
    if(textInput.length <= 0 || textInput == null) {
        $("#profile-error").show();
    } else {
        $("#profile-error").hide();
    }
};