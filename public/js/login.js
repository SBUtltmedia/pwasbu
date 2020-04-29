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
function emailOnChange(id) {
    let emailSign = document.getElementById(id);
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
/**
 * Brute forcing check for string equals
 * @param {String} str1 
 * @param {String} str2 
 */
function strEqual(str1, str2) {
    if(str1.length != str2.length) {
        return false;
    }
    let i = str1.length;
    while(i >= 0) {
        if(str1.charAt(i) != str2.charAt(i)) {
            return false;
        }
        i--;
    }
    return true;
}
function passSignMatch() {
    let passSign2 = document.getElementById("signup-pass-2");
    let passSign = document.getElementById("signup-pass");
    if(!(strEqual(passSign2.value, passSign.value)) && passSign.value.length >= 8) {
        $("#pass_match").show();
    } else {
        $("#pass_match").hide();
    }
}
function passMatch() {
    let passSign2 = document.getElementById("signup-pass-2").value;
    let passSign = document.getElementById("signup-pass").value;
    return strEqual(passSign, passSign2);
}
