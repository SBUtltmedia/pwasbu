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
    name = document.getElementById("user-name").value;
    gender = document.getElementById("user-gender").value;
    if(name.length <= 0 || name == null) {
        $("#profile-error").show();
    } 
    else if(gender.length <= 0 || gender == null) {
        $("#profile-error").show();
    } else {
        $("#profile-error").hide();
        birthdate = document.getElementById("birthdate").value;
        userPayload = JSON.parse(localStorage.getItem("userData"));
        try{   
            userPayload['firstName'] = name;
            userPayload['gender'] = gender;
            userPayload['birthdate'] = birthdate;
            console.log("The data has been updated to :" + JSON.stringify(userPayload));   
            setUser(userPayload['email'], userPayload);
            localStorage.setItem("userData", JSON.stringify(userPayload));
        } catch(error) {
            let user = firebase.auth().currentUser;
            setUser(user.email, generateUser(user.email, name));
        }
        let user = firebase.auth().currentUser;
        let file = document.getElementById("cameraInput").files[0];
        console.log(file);
        
        clearProfilePictures(user.email,
            storageRef.child(`users/${user.email}/profile-picture/` + file.name).put(file)
            .catch((err)=>{console.log(err);}));
    }
    
}
let loadProfilePicture = () => {
    let user = firebase.auth().currentUser;
    let profilePicName = "";
    let listRef = storageRef.child(encodeURI(`users/${user.email}/profile-picture`));
    console.log(listRef);
    console.log("Trying to get a file from" + user.email );
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
    birthdateField = document.getElementById("birthdate");
    birthdateField.max = new Date().toDateInputValue();
    userData = JSON.parse(localStorage.getItem("userData"));
    birthdateField.value = userData['birthdate'];
    document.getElementById("user-name").value = userData['firstName'];
    document.getElementById("user-gender").value = userData['gender'];
    loadProfilePicture();
};
let validString = id => {
    field = document.getElementById(id);
    textInput = field.value;
    if(textInput.length <= 0 || textInput == null) {
        $("#profile-error").show();
    } else {
        $("#profile-error").hide();
    }
};