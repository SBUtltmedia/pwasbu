function accountsettings_template(){
    $("#loader").hide();
    $("#profile-error").hide();
    $("#profile-success").hide();
    // console.log("loading in fields");
    initAccountSettings();
    initNavBar();
}

function controlpanel_template(){
    resetSelectrs();
    initActivitiesTable();
    initNavBar();
    initCampersTable();
    initGroupsTable();
    initUsersTable();
    initUserModal();
    initYearPicker(); // LOCATED in evaluation.js
}

function editprofile_template(){
    $(".loader").hide();
    $("#profile-error").hide();
    $("#profile-success").hide();
    //Date is in YYYY-MM-DD Format
    // console.log("loading in fields");
    initEditProfile();
    function changePhoto() {
        let fileReader = new FileReader();
        fileReader.readAsDataURL(document.getElementById("cameraInput").value);
        fileReader.onloadend = () => {
            console.log(this);
        };
        console.log(document.getElementById("cameraInput").value);
    }

    $("#cameraInput").on("change", function () {
        readURL(this, "profile-pic");
    });
    initNavBar();
}


function evaluation_template(){
    if (currEval.evalMode == "add") {
        document.getElementById("eval-add").style = "display: none;";
        document.getElementById('activities').style = "display: block;";
        actEvalInit();
    } else if (currEval.evalMode == "get") {
        // document.getElementById('evaluations').style = "display: block;";
        // initEvalTable();
        document.getElementById('activities').style = "display: block;";
        actEvalInit();
    } else {
    }
    function evalAdd() {
        document.getElementById("eval-add").style = "display: none;";
        eval(currEval.camperID, 'add');
    }
}

function forgotpassword_template(){
    $(".loader").hide();
    $("#forgot-error").hide();
}

function home_template(){
    function userWelcome() {
        let user = firebase.auth().currentUser;
        try {
            let userData = JSON.parse(localStorage.getItem("userData"));
            // document.getElementById("menu-user").innerHTML = "Welcome " + userData['firstName'];
            document.getElementById("menu-user").innerHTML = (userData['firstName'] + "'S HOME PAGE").toUpperCase();
        } catch (error) {
            fs.collection("users").where('email', '==', user.email).get().then(function (res) {
                if (res.docs.length > 0) {
                    res.docs[0].ref.get().then(doc => {
                        // document.getElementById("menu-user").innerHTML = "Welcome " + doc.data()["firstName"];
                        document.getElementById("menu-user").innerHTML = (doc.data()["firstName"] + "'S HOME PAGE").toUpperCase();
                        localStorage.setItem("userData", JSON.stringify(doc.data()));
                        initNavBar();
                    });
                } else {
                    console.log("There is no such user");
                    document.getElementById("menu-user").innerHTML = "Error loading user, please refresh";
                }
            }).catch((error) => {
                console.log(error);
                document.getElementById("menu-user").innerHTML = "Error loading user, please refresh";
            });
        }
    }
    userWelcome();
    populateYearPicker(); // LOCATED in evaluation.js
    initNavBar(); // LOCATED in navbar.js
    initCampersEvalTable(); // LOCATED in evaluation.js
}

function login_template(){
    $(".navbar").hide();
    $("#signup-birthdate").val(new Date().toDateInputValue());
    $(".signup-form").hide();
    $(".loader").hide();
    $(".signup").css("background", "none");
    $("#pass_tip").hide();
    $("#pass_error").hide();
    $("#login_error").hide();
    $('#pass_match').hide();
    $(".login").click(function () {
        $(".signup-form").hide();
        $(".login-form").show();
        $(".signup").css("background", "none");
        $(".login").css("background", "#fff");
    });

    $(".signup").click(function () {
        $(".signup-form").show();
        $(".login-form").hide();
        $(".login").css("background", "none");
        $(".signup").css("background", "#fff");
    });

    $(".btn").click(function () {
        $(".input").val("");
    });
}

function missinginfo_template(){
    $(".loader").hide();
    $("#forgot-error").hide();
}

function navbar_template(){

}

function userdetails_template(){
    
}

// Navbar Function
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }