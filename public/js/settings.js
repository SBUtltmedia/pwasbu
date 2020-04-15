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
            addUser(userPayload['email'], userPayload);
        } catch(error) {
            let user = firebase.auth().currentUser;
            addUser(user.email, generateUser(user.email, name));
        }
    }
    
}
let initEditProfile = () => {
    birthdateField = document.getElementById("birthdate");
    birthdateField.max = new Date().toDateInputValue();
    userData = JSON.parse(localStorage.getItem("userData"));
    birthdateField.value = userData['birthdate'];
    document.getElementById("user-name").value = userData['firstName'];
    document.getElementById("user-gender").value = userData['gender'];
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