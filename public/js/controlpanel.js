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
            data.push([doc.data()['firstName'], doc.data()['lastName'], doc.data()['id'],
            `<button class='btn bdrlessBtn' onclick='getCamper("${doc.id}")'>Edit</button>`,
            `<button class='btn bdrlessBtn btn-danger' onclick='removeCamper("${doc.id}")'>Remove</button>`
            ]);
        });
        $(document).ready(function() {
            $('#campers').DataTable({        
                data: data,
                columns: [
                    {"title" : "First Name"},
                    {"title" : "Last Name"},
                    {"title" : "UID"},
                    {"title" : ""},
                    {"title" : ""}
                ]
            });
        });
    });
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
    });
}
function addCamper(){
    let userPayload = generateUser("", "John", "Doe", "Female", "camper");
    addUser(userPayload, updateCamperTable);
}
/////////////////////////////////////////// GROUPS FUNCTIONS ///////////////////////////////////////////

/***
 * Populate the groups tables
 */
function initGroupsTable(){
    fs.collection("users").where("priv", "==", "camper").get().then( resCamp => {
        campers = {} // Dictionary of coachIDs
        resCamp.forEach(doc => {
            campers[doc.data()['id']] = doc.data();
        });
        fs.collection("users").where("priv", "==", "coach").get().then( resCoach => {
            coaches = {} // Dictionary of coachIDs
            resCoach.forEach(doc => {
                coaches[doc.data()['id']] = doc.data();
            });
            $('#groups').DataTable({   
                columns: [
                    {"title" : "Coach Name",
                    "searchable": false},
                    {"title" : "Campers",
                    "searchable": false},
                    {"title" : "",
                    "searchable": false},
                    {"title" : "",
                    "searchable": false},
                    {"title" : "",
                     "visible": false},
                     {"title" : "",
                      "visible": false}
                ]
            });
            let allCampers = [];
            Object.keys(campers).forEach(camperId => {
                allCampers.push({
                    username: camperId,
                    fullname: campers[camperId]['firstName'] + ' ' + campers[camperId]['lastName']
                });
            });
            let instrSelect = document.createElement('select'); 
            instrSelect.className = "form-control";
            Object.keys(coaches).forEach(coachId => {
                let opt = document.createElement('option');
                opt.innerHTML = coaches[coachId]['firstName'] + " " + coaches[coachId]['lastName'] + `(id:${coachId})`;
                opt.value = coachId;
                instrSelect.appendChild(opt);
            });
            $(document).ready(function() {
            fs.collection("Groups").get().then(res =>{
                let data = [];
                res.forEach(doc => {
                    try{
                        let camperNames = "";
                        doc.data()['campers'].forEach(camperId => {
                            camperNames += `@${camperId} `;
                        });
                        let tempSelect = instrSelect.cloneNode(true);
                        tempSelect.id = "group-select-" + doc.id;
                        $('#groups').DataTable().row.add([
                        tempSelect.outerHTML, 
                        `<textarea class="form-control" id="${"group-" + doc.id}" rows="1"></textarea>`,
                        `<button class='btn bdrlessBtn' onclick='updateGroup("${doc.id}")'>Update</button>`,
                        `<button class='btn bdrlessBtn btn-danger' onclick='removeGroup("${doc.id}")'>Remove</button>`,
                        coaches[doc.data()['coach']]['firstName'] + " " + coaches[doc.data()['coach']]['lastName'] + `(id:${doc.data()['coach']})`,
                        camperNames
                        ]).draw(); 
                        $('#group-'+ doc.id).suggest('@', {
                            data: allCampers,
                              map: function( user ) {
                                  return {
                                      value: user.username,
                                      text: '<strong>'+user.username+'</strong> <small>'+user.fullname+'</small>'
                                  }
                            }
                        });
                        document.getElementById("group-"+doc.id).value = camperNames;
                        document.getElementById("group-select-" + doc.id).value = doc.data()['coach'];
                    }catch(err) {
                        console.log(err);
                        // DO nothing. Not a valid group.
                    }
                });
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
function addGroup(){
    let payload = {
        coach: "1023",
        campers: ["V4w18"]
    };
    fs.collection('Groups').add(payload).then(()=> {
        updateGroupsTable();
    });
}
function updateGroup(docid) {
    let camperString = document.getElementById("group-" + docid).value;
    var find = '@';
    var re = new RegExp(find, 'g');
    camperString = camperString.replace(re,"").trim();
    let campers = camperString.split(" ");
    campers = removeEmptyIndices(campers);
    let data = {
        campers: campers,
        coach: document.getElementById("group-select-" + docid).value
    };
    fs.collection("Groups").doc(docid).set(data);
}
function initUsersPage() {
    //Does nothing right now
}