function accountsettings_template() {
    $("#loader").hide();
    initAccountSettings();
    initNavBar();

    updateOnlineStatus();
}

function controlpanel_template() {
    // resetSelectrs();
    initYearPicker(); // LOCATED in evaluation.js
    initActivitiesTable();
    initActModal(false);
    initActModal(true);
    initNavBar();
    initCampersTable();
    initGroupsTable();
    initUsersTable();
    initUserModal();

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target.id === "addActivityModal") {
            if(confirm('Are you sure you want to leave the Add Activity Modal? The new activity that you are currently working on will not be saved.')) {
                document.getElementById('addActivityModal').style.display = 'none';
                initActModal(true);
            }
        } else if (event.target.classList.contains("adminConsoleModal")) {
            if(confirm('Are you sure you want to leave the Edit Activity Modal? The edits to the activity that you are currently working on will not be saved.')) {
                document.getElementById('editActivityModal').style.display = 'none';
                initActModal(false);
            }
        } else if (event.target.classList.contains("adminConsoleModal")) {
            event.target.style.display = "none";
        }
    }

    $(`#add-camper-pic`).on("change", function () {
        readURL(this, `add-camper-profile-pic`);
    });

    $(`#edit-camper-pic`).on("change", function () {
        readURL(this, `edit-camper-profile-pic`);
    });

    $(`#modal-user-pic`).on("change", function () {
        readURL(this, `modal-user-profile-pic`);
    });

    $(`#edit-user-pic`).on("change", function () {
        readURL(this, `edit-user-profile-pic`);
    });

    document.getElementById("defaultOpen").click();

    updateOnlineStatus();
}

function editprofile_template() {
    $(".loader").hide();
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

    updateOnlineStatus();
}

function evaluation_template() {
    document.getElementById('activities').style = "display: block;";

    if (currEval.evalMode === "add") {
        let currEvalCamperID = currEval.camperID;
        let currEvalDate = new Date().toDateInputValue();
        let currEvalInstrID = currEval.instrID;
        let currEvalSelectedYear = currEval.selectedYear;
        currEval.reset();
        currEval.camperID = currEvalCamperID;
        currEval.date = currEvalDate;
        currEval.instrID = currEvalInstrID;
        currEval.selectedYear = currEvalSelectedYear;
    }
    fs.collection("users").where("id", "==", currEval.camperID).get()
        .then((snapshot) => {
            if (!snapshot.empty)
                document.getElementById("athlete-header-name").innerHTML = snapshot.docs[0].data()["firstName"] + " " + snapshot.docs[0].data()["lastName"]
            else console.log("Camper with ID " + camperID + " does not exist")
        })
        .catch((err) => { console.log("Could not get camper with id " + currEval.camperID + ": " + err) });

    actEvalInit();

    updateOnlineStatus();
}

function forgotpassword_template() {
    $(".loader").hide();
    $("#forgot-error").hide();

    updateOnlineStatus();
}

function home_template() {
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

    try {
        let userData = JSON.parse(localStorage.getItem("userData"));
        if (userData['priv'].toLowerCase().trim() != "admin") {
            $("#yearPickerContainer").hide();
        }
    } catch (error) {
        let user = firebase.auth().currentUser;
        fs.collection("users").where('email', '==', user.email).get().then(function (res) {
            if (res.docs.length > 0) {
                res.docs[0].ref.get().then(doc => {
                    if (doc.data()['priv'] != "admin") {
                        if (document.getElementById("yearPickerContainer")) {
                            $("#yearPickerContainer").hide();
                        }
                    }
                });
            } else {
                $("#yearPickerContainer").hide();
            }
        }).catch((error) => {
            console.log(error);
            $("#yearPickerContainer").hide();
        });
    }

    updateOnlineStatus();
}

function login_template() {
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

    updateOnlineStatus();
}

function missinginfo_template() {
    $(".loader").hide();
    $("#forgot-error").hide();

    updateOnlineStatus();
}

function navbar_template() {

}

function userdetails_template() {
    updateOnlineStatus();
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