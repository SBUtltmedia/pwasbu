function hideLoginError() {
    $("#login_error").hide();
}
function emailIsValid (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
function passIsValid (password) {
    return password.length >= 8
}

function emailSignOnChange() {
    let emailSign = document.getElementById("signup-email");
    let email = emailSign.value;
    $("#pass_error").hide();
    if(emailIsValid(email)){
        emailSign.style.color = "black";
    } else {
        emailSign.style.color = "#dc3545";
    }
}
function passSignOnChange() {
    let passSign = document.getElementById("signup-pass");
    let password = passSign.value;
    $("#pass_error").hide();
    if(passIsValid(password)) {
        $("#pass_tip").hide();
    } else {
        $("#pass_tip").show();
    }
}