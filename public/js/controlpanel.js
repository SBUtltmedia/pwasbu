/**
 * Enable Tooltip everywhere on this page
 */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

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
function getActivity(id) {
    fs.collection('Activities').doc(id).get().then(doc =>{
        document.getElementById('act-name').value = doc.data()['name'];
        document.getElementById('act-edit').style = "display: block";
        let skills = []
        doc.data()['skills'].forEach((skill) => {
            let temp = {}
            temp['name'] = `<input type="text" class="input" value="${skill['name']}">`;
            let subSkillsStr = "";
            skill['subSkills'].forEach((subSkill)=> {
                subSkillsStr += ' "' + subSkill + '"';
            });
            temp['subSkills'] = `<input type="text" class="input" value=${subSkillsStr}">`;
            skills.push(temp);
        });
        $(document).ready(function() {
            if($('#skills').DataTable()) {
                $('#skills').DataTable().destroy();
            }
            $('#skills').DataTable({  
                data: skills,
                columns: [
                    {"data" : "name"},
                    {"data" : "subSkills"},

                ]
            });
        });
    }).catch(err => {console.log(err);});
}
function addActivity(){
    let data = {
        name: "Example Activity",
        skills: [
            {
                name: "Example Skill",
                subSkills: ["subSkill Example"]
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
                        `<button class='btn bdrlessBtn btn-danger' onclick='removeGroup("${doc.id}")'>Remove</button>`,
                        `<button class='btn bdrlessBtn' onclick='updateGroup("${doc.id}")'>Update</button>`,
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
    campers.forEach(c => {
        campers.forEach(camper=> {
            if(camper == ""){
                campers.splice(campers.indexOf(camper),1);
            }
        });
    });
    let data = {
        campers: campers,
        coach: document.getElementById("group-select-" + docid).value
    };
    // console.log(data);
    fs.collection("Groups").doc(docid).set(data);
}
function initUsersPage() {
    //Does nothing right now
}