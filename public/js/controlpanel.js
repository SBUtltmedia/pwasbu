/**
 * Enable Tooltip everywhere on this page
 */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

//////////////////////////////// Helper Functions /////////////////////////////////////////////////
/**
 * An empty indice is an element with value ''
 */
function removeEmptyIndices(array){
    array.forEach(a => {
        // Not the best solution but accounts for changing indices
        array.forEach(b => {
            if(b == ""){
                array.splice(array.indexOf(b),1);
            }
        });
    });
    return array;
}
//////////////////////////////// ACTIVITY FUNCTIONS //////////////////////////////////////////////
const editor = "";
/**
 * Prepares the activity data to the correct format for DataTables
 * @param {*} data 
 * @returns A finished 2-D array populated with the correct data fields
 */
function populateAct(data) { 
    let finishedArray = [];
    data.forEach((d, i) => {
        finishedArray.push([d['name'],
        `<button class='btn bdrlessBtn' onclick='getActivity("${d['id']}")'>Edit</button>`,
        `<button class='btn bdrlessBtn btn-danger' onclick='removeActivity("${d['id']}")'>Remove</button>`
    ]);
    });
    return finishedArray;
}
/***
 * Populate the activities tables
 */
function initActivitiesTable(){
    fs.collection("Activities").get().then(res =>{
        let names = [];
        res.forEach(doc => {
            names.push({
                name: doc.data()['name'],
                id: doc.id 
            });
        });
        let data = populateAct(names);
        $(document).ready(function() {
            $('#activities').DataTable({        
                data: data,
                columns: [
                    {"title" : "Name"},
                    {"title" : ""},
                    {"title" : ""}
                ]
            });
        });
    });
}
/**
 * Populates the edit activity field
 * @param {*} id 
 */
function removeActivity(id) {
    fs.collection('Activities').doc(id).delete().then(()=>{
        $(document).ready(function() {
            $('#activities').DataTable().destroy();
            initActivitiesTable();
        });
    });
}
function updateActivity(id){
    let skillsTable = $("#skills").DataTable().rows().data();
    let checkTable = $('#checklist').DataTable().rows().data();
    let skills = [];
    let checklist = [];
    let activityName = document.getElementById("act-name").value;
    /////////////////////// update to checklist ///////////////////////////////
    for(let i = 0; i < checkTable.length; i++) {
        let id = checkTable[i][5];
        let checkName = document.getElementById("check-" + id).value;
        let checkUnit = document.getElementById("check-unit-" + id).value;
        checklist.push({name:checkName, type:checkUnit});
    }
    /////////////////////// update to skills ///////////////////////////////
    for(let i = 0; i < skillsTable.length; i++){
        let id = skillsTable[i][5];
        let skillName = document.getElementById("skill-" + id).value;
        let subSkillStr = document.getElementById("subskill-" + id).value;
        let subSkills = subSkillStr.split(",");
        subSkills = removeEmptyIndices(subSkills);
        skills.push({
            skillName: skillName,
            subSkills: subSkills
        });
    }
    console.log(JSON.stringify({checklist: checklist, name: activityName, skills: skills}));
}
function getActivity(id) {
    fs.collection('Activities').doc(id).get().then(doc =>{
        document.getElementById('act-name').value = doc.data()['name'];
        document.getElementById('act-edit').style = "display: block";
        ///////////////////////////////////////     init checkList Table /////////////////////////////////////////
        let checklist = []
        doc.data()['checklist'].forEach((checkItem) => {
            let id = checkItem['name'] + Math.random().toString(36).substring(2, 8);
            let temp = [
                `<input type="text" id="${"check-" + id}" class="input" value="${checkItem['name']}">`,
                `<input type="text" id="${"check-unit-" + id}" class="input" value="${checkItem['type']}">`,
                `<button class='btn bdrlessBtn' onclick='removeCheck("${id}")'>Remove</button>`,
                checkItem['name'], checkItem['type'], id
            ];
            checklist.push(temp);
        });
        ///////////////////////////////////////     init Skills Table  //////////////////////////////////////////
        let skills = []
        doc.data()['skills'].forEach((skill) => {
            let subSkillsStr = "";
            skill['subSkills'].forEach((subSkill)=> {
                subSkillsStr += '' + subSkill + ",";
            });
            let id = skill['skillName'] + Math.random().toString(36).substring(2, 8);
            let temp = [
                `<input type="text" id="${"skill-" + id}" class="input" value="${skill['skillName']}">`,
                `<input type="text" id="${"subskill-" + id}" class="input" value="${subSkillsStr}">`,
                `<button class='btn bdrlessBtn' onclick='removeSkill("${id}")'>Remove</button>`,
                skill['skillName'], subSkillsStr, id
            ];
            skills.push(temp);
        });
        $(document).ready(function() {
            ////////////////// add data to checklist table //////////////////////////
            if(!$('#checklist').DataTable()){
                $('#checklist').DataTable({  
                    columns: [
                        {"title" : "Checklist Name", 'searchable': false},
                        {"title" : "Unit of Measure", 'searchable': false},
                        {"title" : "", 'searchable': false},
                        {"title": "", 'visible' : false},
                        {"title": "", 'visible' : false},
                        {"title": "", 'visible' : false,'searchable': false}
                    ]
                });
            }
            $('#checklist').DataTable().clear();
            $('#checklist').DataTable().rows.add(checklist).draw();
            ////////////////// add data to Skills Table ////////////////////////////
            if(!$('#skills').DataTable()) {
                $('#skills').DataTable({  
                    columns: [
                        {"title" : "Skill Name", 'searchable': false},
                        {"title" : "Subskills", 'searchable': false},
                        {"title" : "", 'searchable': false},
                        {"title": "", 'visible' : false},
                        {"title": "", 'visible' : false},
                        {"title": "", 'visible' : false,'searchable': false}
                    ]
                });
            }
            $('#skills').DataTable().clear();
            $('#skills').DataTable().rows.add(skills).draw();
            document.getElementById("update-activity").onclick = function(){updateActivity(id)};
        });
    }).catch(err => {console.log(err);});
}
function addSkill(){
    let id = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    let tempSkill = [
        `<input type="text" id="${"skill-" + id}" class="input" value="Skill">`, 
        `<input type="text" id="${"subskill-" + id}" class="input" value="Subskill, Subskill">`,
        `<button class='btn bdrlessBtn' onclick='removeSkill("${id}")'>Remove</button>`,
        "Skill", "Subskill, Subskill", id
    ]
    $('#skills').DataTable().row.add(tempSkill).draw();
}
function removeSkill(id){
    let skillTable = $('#skills').DataTable().rows().data();
    for(let i = 0; i < skillTable.length; i++) {
        let skillID = skillTable[i][5];
        if(skillID == id) {
            skillTable.row(i).remove().draw();
            break;
        }
    }
}
function addCheckList(){
    let id = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    let checklist = [
        `<input type="text" id="${"check-" + id}" class="input" value="Example Checklist name">`, 
        `<input type="text" id="${"check-unit-" + id}" class="input" value="inches">`,
        `<button class='btn bdrlessBtn' onclick='removeCheck("${id}")'>Remove</button>`,
        "Example Checklist name", "inches", id
    ]
    $('#checklist').DataTable().row.add(checklist).draw();
}
function removeCheck(id){
    let checkTable = $('#checklist').DataTable().rows().data();
    for(let i = 0; i < checkTable.length; i++) {
        let checkID = checkTable[i][5];
        if(checkID == id) {
            checkTable.row(i).remove().draw();
            break;
        }
    }
}
function addActivity(){
    let data = {
        checklist: [{name: "example check list item", type: "unit of measurement"}],
        name: "Example Activity",
        skills: [
            {
                name: "Example Skill",
                subSkills: ["subSkill Example", "Another subskill"]
            }
        ]
    };
    fs.collection("Activities").add(data).then((docRef)=>{
        $(document).ready(function() {
            let table = $('#activities').DataTable();
            table.row.add([
                "Example Activity", 
                `<button class='btn bdrlessBtn' onclick='getActivity("${docRef.id}")'>Edit</button>`,
                `<button class='btn bdrlessBtn btn-danger' onclick='removeActivity("${docRef.id}")'>Remove</button>`
            ]).draw();
        });
    });
}
////////////////////////////////////// CAMPER FUNCTIONS /////////////////////////////////////////////
/***
 * Populate the campers tables
 */
function initCampersTable(){
    fs.collection("users").where("priv", "==", "camper").get().then(res =>{
        let data = [];
        res.forEach(doc => {
            data.push([
                `<input type="text" id="${"camper-first" + doc.id}" class="form-control" value="${doc.data()['firstName']}">`, 
                `<input type="text" id="${"camper-last" + doc.id}" class="form-control" value="${doc.data()['lastName']}">`, 
                doc.data()['id'],
                `<input type="file" id="camper-upload-${doc.id}" style="display:none" accept="image/*" capture="camera"/> 
                <button id="camper-pic-button-${doc.id}">
                    <img id="camper-profile-pic-${doc.id}" src="../img/user/default/user-480.png" class="img-thumbnail rounded float-left" width="100" height="100">
                </button>`,
                `<button class='btn bdrlessBtn' onclick='updateCamper("${doc.id}", "${doc.data()['id']}")'>Update</button>`,
                `<button class='btn bdrlessBtn btn-danger' onclick='removeCamper("${doc.id}")'>Remove</button>`,
                doc.data()['firstName'],
                doc.data()['lastName']
            ]);
        });
        $(document).ready(function() {
            $('#campers').DataTable({        
                data: data,
                columns: [
                    {"title" : "First Name", 'searchable': false},
                    {"title" : "Last Name", 'searchable': false},
                    {"title" : "UID"},
                    {"title" : "Picture", 'searchable': false},
                    {"title" : ""},
                    {"title" : ""},
                    {"title": "", 'visible' : false},
                    {"title": "", 'visible' : false}
                ]
            });
            res.forEach(doc => {
                document.getElementById(`camper-pic-button-${doc.id}`).onclick = () => {$(`#camper-upload-${doc.id}`).trigger('click');};
                loadCamperImage(`camper-profile-pic-${doc.id}`, doc.data()['id']);
                $(`#camper-upload-${doc.id}`).on("change", function () {
                    readURL(this, `camper-profile-pic-${doc.id}`);
                });
            });
            });
        });
}

function loadCamperImage(elementID, camperEmail) {
    loadProfilePictureInElement(document.getElementById(elementID), camperEmail);
}
function updateCamperTable(){
    $(document).ready(function() {
        $('#campers').DataTable().destroy();
        initCampersTable();
    });
}
function removeCamper(docid) {
    fs.collection('users').doc(docid).delete().then(()=>{
        updateCamperTable();
        updateGroupsTable();
    });
}
function addCamper(){
    let userPayload = generateUser("", "John", "Doe", "Female", "", "camper");
    addUser(userPayload, updateCamperTable);
}
function updateCamper(docid, camperId){
    let firstName = document.getElementById("camper-first" + docid).value;
    let lastName = document.getElementById("camper-last" + docid).value;
    let file = document.getElementById(`camper-upload-${docid}`).files[0];
    try{
        clearProfilePictures(camperId, 
            storageRef.child(`users/${camperId}/profile-picture/` + file.name).put(file)); 
    } catch(err) {
        console.log(err);
    }
    fs.collection("users").doc(docid).update({
        firstName: firstName,
        lastName: lastName
    }).then(()=>{
        alert("User has been updated successfully!");
    });
}
/////////////////////////////////////////// GROUPS FUNCTIONS ///////////////////////////////////////////

/**
 *  Adds a coach group with the specified coachID
 */
function addCoachGroup(coachID){
    let data = {
        campers: [],
        coach: coachID
    };
    fs.collection("Groups").add(data);
}

/***
 * Populate the groups tables
 */
function initGroupsTable(){
    fs.collection("users").where("priv", "==", "camper").get().then( resCamp => {
        campers = {} // Dictionary of camperIDs
        resCamp.forEach(doc => {
            campers[doc.data()['id']] = doc.data();
        });
        fs.collection("users").where("priv", "==", "coach").get().then( resCoach => {
            coaches = {} // Dictionary of coachIDs
            resCoach.forEach(doc => {
                coaches[doc.data()['id']] = doc.data();
                coaches[doc.data()['id']]['hasGroup'] = false; 
            });
            $('#groups').DataTable({   
                columns: [
                    {"title" : "Coach Name",
                    "searchable": false},
                    {"title" : "Athletes",
                    "searchable": false},
                    {"title" : "",
                    "searchable": false},
                    // {"title" : "",
                    // "searchable": false},
                     {"title" : "",
                      "visible": false}
                ]
            });
            // Deprecated (No longer in use) - @1
            // let allCampers = [];
            // Object.keys(campers).forEach(camperId => {
            //     allCampers.push({
            //         username: camperId,
            //         fullname: campers[camperId]['firstName'] + ' ' + campers[camperId]['lastName']
            //     });
            // });
            // let coachSelectrData = [];
            // Object.keys(coaches).forEach(coachId => {
            //     data = {
            //         text: coaches[coachId]['firstName'] + " " + coaches[coachId]['lastName'] + ` (id:${coachId})`,
            //         value: coachId
            //     }
            //     coachSelectrData.push(data);
            // });
            $(document).ready(function() {
            fs.collection("Groups").get().then(res =>{
                let data = [];
                res.forEach(doc => {
                    let changedDoc = false;
                    let docData = JSON.parse(JSON.stringify(doc.data()));
                    try{
                        let camperNames = "";
                        let camperSelection = [];
                        doc.data()['campers'].forEach(camperId => {
                            try{
                                camperName = campers[camperId]['firstName'] + " " + campers[camperId]['lastName'] + " (id:" + camperId + ")";
                                camperNames += camperName;
                            } catch(err){
                                docData['campers'].splice([docData['campers'].indexOf(camperId)], 1);
                                changedDoc = true;
                                console.log("Camper with id " + camperId + " has been removed from the list");
                                // Camper doesn't exist
                            }
                        });
                        Object.keys(campers).forEach(camperId => {
                            try{
                                camperName = campers[camperId]['firstName'] + " " + campers[camperId]['lastName'] + " (id:" + camperId + ")";
                                data = {
                                    text: camperName,
                                    value: camperId
                                };
                                if(doc.data()['campers'].indexOf(camperId) >= 0) {
                                    data['selected'] = true;
                                }
                                camperSelection.push(data);
                            } catch(err) {
                                // Camper doesn't exist
                            }
                        });
                        let coachName = "Coach no longer exist"
                        try{
                            coachName = coaches[doc.data()['coach']]['firstName'] + " " + coaches[doc.data()['coach']]['lastName'] + `(id:${doc.data()['coach']})`;
                            coaches[doc.data()['coach']]['hasGroup'] = true;
                        } catch(err) {
                            // Coach no longer exists
                        }
                        $('#groups').DataTable().row.add([
                        coachName,
                        `<select class="form-control" id="${"group-" + doc.id}"></select>`,
                        `<button class='btn bdrlessBtn' onclick='updateGroupSelectr("${doc.id}")'>Update</button>`,
                        // `<button class='btn bdrlessBtn btn-danger' onclick='removeGroup("${doc.id}")'>Remove</button>`,
                        camperNames
                        ]).draw(); 
                        new Selectr('#group-'+ doc.id, {
                            data: camperSelection,
                            multiple:true
                        });
                        // let coachSelectr = new Selectr("#group-select-" + doc.id, {
                        //     data:coachSelectrData
                        // });
                        // Deprecated (No longer in use) - @1
                        // $('#group-'+ doc.id).suggest('@', {
                        //     data: allCampers,
                        //       map: function( user ) {
                        //           return {
                        //               value: user.username,
                        //               text: '<strong>'+user.username+'</strong> <small>'+user.fullname+'</small>'
                        //           }
                        //     }
                        // });
                        // document.getElementById("group-"+doc.id).value = camperNames;
                        // coachSelectr.setValue(doc.data()['coach']);
                        // document.getElementById("group-select-" + doc.id).value = doc.data()['coach'];
                    }catch(err) {
                        console.log(err);
                        // DO nothing. Not a valid group.
                    }
                    if(changedDoc) {
                        fs.collection("Groups").doc(doc.id).set(docData);
                    }
                });            
                let reset = false;
                Object.keys(coaches).forEach(coachId => {
                    if (!coaches[coachId]['hasGroup']) {
                        let coachName = "Coach no longer exist"
                        try{
                            coachName = coaches[coachId]['firstName'] + " " + coaches[coachId]['lastName'] + `(id:${coachId})`;
                            coaches[doc.data()]['hasGroup'] = true;
                        } catch(err) {
                            // Coach no longer exists
                        }
                        addCoachGroup(coachId);
                        reset = true;
                    }
                });
                if(reset) {
                    updateGroupsTable();
                }
            });
            });
        });
    });
}

function updateGroupsTable(){
    $(document).ready(function() {
        $('#groups').DataTable().clear();
        $('#groups').DataTable().destroy(); // The destroy function literally does nothing to contents of table. requires override
        initGroupsTable();
    });
}
function removeGroup(docid) {
    fs.collection('Groups').doc(docid).delete().then(()=>{
        updateGroupsTable();
    });
}
// function addGroup(){
//     let payload = {
//         coach: "1023",
//         campers: [""]
//     };
//     fs.collection('Groups').add(payload).then(()=> {
//         updateGroupsTable();
//     });
// }
// DEPRECATED FUNCTION - @1
// function updateGroup(docid) {
//     let camperString = document.getElementById("group-" + docid).value;
//     var find = '@';
//     var re = new RegExp(find, 'g');
//     camperString = camperString.replace(re,"").trim();
//     let campers = camperString.split(" ");
//     campers = removeEmptyIndices(campers);
//     let data = {
//         campers: campers,
//         coach: document.getElementById("group-select-" + docid).value
//     };
//     fs.collection("Groups").doc(docid).set(data);
// }
function updateGroupSelectr(docid) {
    let data = {
        campers: $('#group-'+ docid).val()
    };
    fs.collection("Groups").doc(docid).update(data);
}

/////////////////////////////////// USERS FUNCTIONS ////////////////////////////////////////////////////
function initUsersTable(){
    $('#users').DataTable({   
        columns: [
            {"title" : "Name"},
            {"title" : "Role",
            "searchable": false},
            {"title" : "",
            "searchable": false},
            // {"title" : "",
            //  "searchable": false},
             {"title" : "",
              "visible": false}
        ]
    });
    fs.collection("users").get().then( res => {
        users = [] // Dictionary of userIDs !!!!!!!!!!!!!!!!!!!! IGNORES CAMPERS !!!!!!!!!!!!!!!!!!!
        let userData = JSON.parse(localStorage.getItem("userData"));
        res.forEach(doc => {
            if(doc.data()['email'] != userData['email']){
                if(doc.data()['priv'] != "camper") {
                    $('#users').DataTable().row.add([
                        doc.data()['firstName'] + " " + doc.data()['lastName'],
                        `<div class="form-group"> 
                            <select class="form-control" id="users-priv-${doc.id}"> 
                                <option value="admin">Admin</option>
                                <option value="coach">Coach</option>
                                <option value=".">Basic</option>
                                <option value="parent">Parent</option>
                            </select> 
                        </div>`,
                        `<button class='btn bdrlessBtn' onclick='updateUser("${doc.id}")'>Update</button>`,
                        // `<button class='btn bdrlessBtn btn-danger' onclick='removeUser("${doc.id}")'>Remove</button>`,
                        doc.data()['priv']
                    ]).draw();
                    // console.log(doc.data());
                    document.getElementById("users-priv-" + doc.id).value = doc.data()['priv'];
                }
            }
        });
    });
}
function updateUser(docid){
    let priv = document.getElementById("users-priv-" + docid).value;
    fs.collection("users").doc(docid).update({ 
        priv: priv
    }).then(()=> {
        alert("User has been updated!");
    });
}
function newAccountPasswordReset(firstName, email){
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        $("#modal-user").modal("hide"); 
        alert(`${firstName} has been added successfully! Password reset has been sent to the ${email}`);
        $('#users').DataTable().clear();
        $('#users').DataTable().destroy();
        initUsersTable();
    }).catch(function(error) {
        var errorMessage = error.message;
        console.log(errorMessage);
        document.getElementById("modal-user-error").style = "display: block";
        document.getElementById("modal-user-error").innerHTML = errorMessage;
    });
}
function addModalUser() {
    document.getElementById("modal-user-error").style = "display: none";
    let firstName = document.getElementById("modal-user-first").value;
    let lastName = document.getElementById("modal-user-last").value;
    let gender = document.getElementById("modal-user-gender").value;
    let email = document.getElementById("modal-user-email").value;
    let password = document.getElementById("modal-user-pass").value;
    let priv = document.getElementById("modal-user-priv").value;
    if(password.length == 0){
        password = "password123";
    }        
    signUpFB.auth().createUserWithEmailAndPassword(email, password).then(()=>{
        console.log("The user has successfully been signed up!");
        let userPayload = generateUser(email, firstName, lastName, gender, "", priv);
        addUser(userPayload, newAccountPasswordReset(firstName, email));
    }).catch(function(error) {
        var errorMessage = error.message;
        console.log(errorMessage);
        document.getElementById("modal-user-error").style = "display: block";
        document.getElementById("modal-user-error").innerHTML = errorMessage;
      });
}
/**
 * Function to be used only under admin controls
 * @param {} email 
 */
function removeUserData(email){
    fs.collection("users").get().then( res => {
        res.forEach(doc => {
            if(doc.data()['email'] == email) {
                doc.delete();
                console.log("A document with id : " + doc.id + " has been deleted!");
            }
        });
    });
}
function initUserModal(){
    document.getElementById("modal-user-save").onclick = addModalUser;
    document.getElementById("modal-user-error").style = "display: none";
}