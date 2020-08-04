/**
 * Enable Tooltip everywhere on this page
 */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

const selectrIDs = {};

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

function createSelectElement(options, values, selected, id, classes) {
    let select = document.createElement("select"); 
    select.classList.add(...classes);
    select.id = id;
    for (let i = 0; i < options.length; i++) {
        let selectedTxt = "";
        if(values[i] == selected) {
            selectedTxt = "selected";
        }
        let optionTxt = `<option value="${values[i]}" ${selectedTxt}>${options[i]}</option>`;
        select.innerHTML += optionTxt;
    }
    return select;
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
                    {"title" : "", "searchable": false},
                    {"title" : "", 'searchable': false}
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
            $('#activities').DataTable().clear();
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
    fs.collection('Activities').doc(id).update({checklist: checklist, name: activityName, skills: skills}).then(()=>{
        alert(`${activityName} has been updated successfully!`);
    }).catch(err => {
        alert(err);
    });
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
    $(document).ready(function() {
        fs.collection("users").where("priv", "==", "camper").get().then(res =>{
            let data = [];
            res.forEach(doc => {
                let pronoun = "They/Them/Theirs";
                // Retrieve Camper Pronouns
                try {
                    if(doc.data()['pronoun']){
                        pronoun = doc.data()['pronoun'];
                    }
                } catch(err) { //Do Nothing 
                }
                // Retrieve Camper Gender
                let gender = "Non-Binary";
                try {
                    if(doc.data()['gender']){
                        gender = doc.data()['gender'];
                    }
                } catch(err) { //Do Nothing 
                }
                let birthdate = "1999/07/04";
                try {
                    birthdate = doc.data()['birthdate'];
                } catch(err) {}
                
                let insertedRow = document.getElementById('campers').insertRow();
                // Insert a cell in the row at cell index 0
                insertedRow.insertCell().innerHTML = 
                `<input type="file" id="camper-upload-${doc.id}" style="display:none" accept="image/*" capture="camera"/> 
                <button id="camper-pic-button-${doc.id}">
                    <img id="camper-profile-pic-${doc.id}" src="../img/user/default/user-480.png" class="img-thumbnail rounded float-left" width="100" height="100">
                </button>`;
                insertedRow.insertCell().innerHTML = `<input type="text" id="${"camper-first" + doc.id}" class="form-control" value="${doc.data()['firstName']}">`;
                insertedRow.insertCell().innerHTML = `<input type="text" id="${"camper-last" + doc.id}" class="form-control" value="${doc.data()['lastName']}">`;
                insertedRow.insertCell().innerHTML = 
                `<select class="form-control" id="camper-gender${doc.id}"> 
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                </select>`;
                insertedRow.insertCell().innerHTML = `<input type="date" id="camper-dob-${doc.id}" min="1950-01-01" value="${birthdate}">`;
                insertedRow.insertCell().innerHTML = 
                `<select class="form-control" id="camper-pronoun${doc.id}"> 
                        <option value="She/Her/Hers">She/Her/Hers</option>
                        <option value="He/Him/His">He/Him/His</option>
                        <option value="They/Them/Theirs">They/Them/Theirs</option>
                    </select>`;
                insertedRow.insertCell().innerHTML =  doc.data()['id'];
                insertedRow.insertCell().innerHTML =  `<button class='btn bdrlessBtn' onclick='updateCamper("${doc.id}", "${doc.data()['id']}")'>Update</button>`;
                insertedRow.insertCell().innerHTML = `<button class='btn bdrlessBtn btn-danger' onclick='removeCamper("${doc.id}")'>Remove</button>`;
                insertedRow.insertCell().innerHTML = doc.data()['firstName'];
                insertedRow.insertCell().innerHTML = doc.data()['lastName'];
                insertedRow.insertCell().innerHTML = birthdate;
                insertedRow.insertCell().innerHTML = pronoun;
                insertedRow.insertCell().innerHTML = gender;
                //Load in selected values
                document.getElementById(`camper-pronoun${doc.id}`).value = pronoun;
                document.getElementById(`camper-gender${doc.id}`).value = gender;
                //Load image
                document.getElementById(`camper-pic-button-${doc.id}`).onclick = () => {$(`#camper-upload-${doc.id}`).trigger('click');};
                loadCamperImage(`camper-profile-pic-${doc.id}`, doc.data()['id']);
                $(`#camper-upload-${doc.id}`).on("change", function () {
                    readURL(this, `camper-profile-pic-${doc.id}`);
                });
            });
            $('#campers').DataTable({     
                columns: [
                    {"title" : "Picture", 'searchable': false},
                    {"title" : "First Name", 'searchable': false},
                    {"title" : "Last Name", 'searchable': false},
                    {"title" : "Gender", 'searchable': false},
                    {"title" : "DoB", 'searchable': false},
                    {"title" : "Pronouns", 'searchable': false},
                    {"title" : "UID"},
                    {"title" : ""},
                    {"title" : ""},
                    {"title": "", 'visible' : false},
                    {"title": "", 'visible' : false},
                    {"title": "", 'visible' : false},
                    {"title": "", 'visible' : false},
                    {"title": "", 'visible' : false}
                ]
            });
        });
    });
}

function loadCamperImage(elementID, camperEmail) {
    loadProfilePictureInElement(document.getElementById(elementID), camperEmail);
}
function updateCamperTable(){
    $(document).ready(function() {
        $('#campers').DataTable().clear();
        $('#campers').DataTable().destroy();
        $("#campers tr").remove(); 
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
    let pronoun = document.getElementById(`camper-pronoun${docid}`).value;
    let gender = document.getElementById(`camper-gender${docid}`).value;
    let birthdate = document.getElementById(`camper-dob-${docid}`).value || "1999-07-04";
    let file = document.getElementById(`camper-upload-${docid}`).files[0];
    try{
        clearProfilePictures(camperId, 
            storageRef.child(`users/${camperId}/profile-picture/` + file.name).put(file)); 
    } catch(err) {
        console.log(`The user ${firstName} ${lastName} does not have a profile picture`);
    }
    fs.collection("users").doc(docid).update({
        firstName: firstName,
        lastName: lastName,
        pronoun: pronoun,
        birthdate: birthdate,
        gender: gender
    }).then(()=>{
        alert("User has been updated successfully!");
        updateGroupsTable();
    });
}
/////////////////////////////////////////// GROUPS FUNCTIONS ///////////////////////////////////////////

/**
 *  Adds a coach group with the specified coachID
 */
function addCoachGroup(coachID){
    let data = {
        campers: [],
        coach: coachID,
        year: document.getElementById("yearPicker").value
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
            
            fs.collection("users").where("priv", "==", "admin").get().then( resCoach => {
                resCoach.forEach(doc => {
                    coaches[doc.data()['id']] = doc.data();
                    coaches[doc.data()['id']]['hasGroup'] = false; 
                });
                fs.collection("Groups").where("year", "==", document.getElementById("yearPicker").value).get().then(res =>{
                    let data = [];
                    res.forEach(doc => {
                        let changedDoc = false;
                        let docData = JSON.parse(JSON.stringify(doc.data()));
                        try{
                            let camperNames = "";
                            // let camperSelection = [];
                            let camperOptionHTML = "";
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
                                    let camperName = campers[camperId]['firstName'] + " " + campers[camperId]['lastName'] + " (id:" + camperId + ")";
                                    let optionStr = `<option value="${camperId}" ${(doc.data()['campers'].indexOf(camperId) >= 0 ? 'selected': '')}> ${camperName}</option>`;
                                    camperOptionHTML += optionStr;
                                    // data = {
                                    //     text: camperName,
                                    //     value: camperId
                                    // };
                                    // if(doc.data()['campers'].indexOf(camperId) >= 0) {
                                    //     data['selected'] = true;
                                    // }
                                    // camperSelection.push(data);
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
                            // let select = document.createElement("select"); 
                            // select.id = '#group-'+ doc.id;
                            // select.classList.add('form-control');
                            let insertedRow = document.getElementById('groups').insertRow();
                            // Insert a cell in the row at cell index 0
                            insertedRow.insertCell().innerHTML = coachName;
                            insertedRow.insertCell().innerHTML = `<select class="" id="${"group-" + doc.id}" multiple="multiple">${camperOptionHTML}</select>`;
                            insertedRow.insertCell().innerHTML = `<button class='btn bdrlessBtn' onclick='updateGroupSelectr("${doc.id}")'>Update</button>`;
                            insertedRow.insertCell().innerHTML = camperNames;
                            $("#group-" + doc.id).select2();
                            // if(!(doc.id in selectrIDs)) {
                            //     let sObj = new Selectr("#group-" + doc.id, {
                            //         data: camperSelection,
                            //         multiple:true
                            //     });
                            //     sObj.mobileDevice = false;
                            //     selectrIDs[doc.id] = sObj;
                            // } else {
                            //     let sObj = selectrIDs[doc.id];
                            //     sObj.removeAll();
                            //     sObj.add(camperSelection);
                            // }
                            passed = false;
                        }catch(err) {
                            console.log(err);
                            // DO nothing. Not a valid group.
                        }
                        if(changedDoc) {
                            fs.collection("Groups").doc(doc.id).set(docData);
                        }
                    });            
                    $('#groups').DataTable({   
                        columns: [
                            {"title" : "Coach Name"},
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
                    // Check for any inconsistency in the data
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
    $('#groups').DataTable().clear();
    $('#groups').DataTable().destroy();
    $("#groups tr").remove(); 
    initGroupsTable();
}
function removeGroup(docid) {
    fs.collection('Groups').doc(docid).delete().then(()=>{
        updateGroupsTable();
    });
}
function initYearPicker() {
    let years = ['2020'];
    // years.sort();
    for(i = 0; i < years.length; i++) {
        $("#yearPicker").append(`<option value="${years[i]}">${years[i]}</option>`);
    }
    document.getElementById("yearPicker").value = '2020';
    // fs.collection("Groups").get().then(res => {
    //     res.docs.forEach(group => {
    //         if(!years.includes(group.data()['year'])) {
    //             years.push(group.data()['year']);
    //         }
    //     });
    //     years.sort();
    //     for(i = 0; i < years.length; i++) {
    //         $("#yearPicker").append(`<option value="${years[i]}">${years[i]}</option>`);
    //     }
    //     if(years.indexOf(new Date().getFullYear()) < 0){
    //         $("#yearPicker").append(`<option value="${new Date().getFullYear()}">${new Date().getFullYear()}</option>`);
    //     }
    //     document.getElementById("yearPicker").value = new Date().getFullYear();
    // });
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
    fs.collection("Groups").doc(docid).update(data).then(()=>{
        alert("Updated coach group successfully!");
    });
}

/////////////////////////////////// USERS FUNCTIONS ////////////////////////////////////////////////////
function initUsersTable(){
    $(document).ready(function() {
        fs.collection("users").get().then( res => {
            let userData = JSON.parse(localStorage.getItem("userData"));
            users = [] // Dictionary of userIDs !!!!!!!!!!!!!!!!!!!! IGNORES CAMPERS !!!!!!!!!!!!!!!!!!!
            res.forEach(doc => {
                if(doc.data()['email'] != userData['email']){
                    if(doc.data()['priv'] != "camper") {
                        let options = ["Admin", "Coach", "Basic", "Parent"];
                        let values = ["admin", "coach", ".", "parent"];
                        let classes = ['form-control'];
                        let select = createSelectElement(options, values, doc.data()['priv'], "users-priv-" + doc.id, classes);
                        let insertedRow = document.getElementById('users').insertRow();
                        // Insert a cell in the row at cell index 0
                        insertedRow.insertCell().innerHTML =  
                        `<input type="file" id="user-upload-${doc.id}" style="display:none" accept="image/*" capture="camera"/> 
                        <button id="user-pic-button-${doc.id}">
                            <img id="user-profile-pic-${doc.id}" src="../img/user/default/user-480.png" class="img-thumbnail rounded float-left" width="100" height="100">
                        </button>`;
                        insertedRow.insertCell().innerHTML = doc.data()['firstName'] + " " + doc.data()['lastName'] + " (ID:" + doc.data()['id'] + ")";
                        insertedRow.insertCell().innerHTML = doc.data()['gender'];
                        insertedRow.insertCell().innerHTML = doc.data()['email'];
                        insertedRow.insertCell().innerHTML = doc.data()['creationDate'];
                        insertedRow.insertCell().innerHTML = select.outerHTML;
                        insertedRow.insertCell().innerHTML = `<button class='btn bdrlessBtn' onclick='updateUser("${doc.id}")'>Update</button>`;
                        insertedRow.insertCell().innerHTML = doc.data()['priv'];

                        //Loading images
                        try {
                            document.getElementById(`user-pic-button-${doc.id}`).onclick = () => {$(`#user-upload-${doc.id}`).trigger('click');};
                            loadCamperImage(`user-profile-pic-${doc.id}`, doc.data()['email']);
                            $(`#user-upload-${doc.id}`).on("change", function () {
                                readURL(this, `user-profile-pic-${doc.id}`);
                            });
                        } catch(err) {
                            console.log(`Something wrong with user : ${doc.data()['firstName']} ${doc.data()['lastName']}`);
                        }
                    }
                }
            });
            $('#users').DataTable({   
                columns: [
                    {"title" : "Picture",
                    "searchable": false},
                    {"title" : "Name"},
                    {"title" : "Gender"},
                    {"title" : "Email"},
                    {"title" : "Created"},
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
        });
    });
}
function updateUsersTable(){
    $('#users').DataTable().clear();
    $('#users').DataTable().destroy();
    $("#users tr").remove(); 
    initUsersTable();
}
function updateUser(docid){
    let priv = document.getElementById("users-priv-" + docid).value;
    let file = document.getElementById(`user-upload-${docid}`).files[0];
    fs.collection("users").doc(docid).get().then(doc => { 
        try{
            clearProfilePictures(doc.data()['email'], 
                storageRef.child(`users/${doc.data()['email']}/profile-picture/` + file.name).put(file));
        } catch(err) {
            console.log(`The user ${doc.data()['firstName']} ${doc.data()['lastName']} does not have a profile picture`);
        }
    });
    
    fs.collection("users").doc(docid).update({ 
        priv: priv
    }).then(()=> {
        alert("User has been updated!");
        updateGroupsTable();
    });
}
function newAccountPasswordReset(firstName, email){
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        $("#modal-user").modal("hide"); 
        updateUsersTable();
        alert(`${firstName} has been added successfully! Password reset has been sent to the ${email}`);
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

//** MISCELLANEOUS Functions */

function togglePrimaryColor(id) {
    let classes = document.getElementById(id).classList;
    if(classes.contains("cp-toggleColor")) {
        classes.remove("cp-toggleColor");
    } else {
        classes.add("cp-toggleColor");
    }
}

function resetSelectrs(){
    for (let ptr in selectrIDs) {
        if (selectrIDs.hasOwnProperty(ptr)) {
            delete selectrIDs[ptr];
        }
    }
    console.log("I am resetting selectrIDs");
}