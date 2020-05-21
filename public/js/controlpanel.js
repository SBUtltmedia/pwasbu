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
        console.log(data);
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
            campers[doc.data['id']] = doc.data();
        });
        fs.collection("users").where("priv", "==", "coach").get().then( resCoach => {
            coaches = {} // Dictionary of coachIDs
            resCoach.forEach(doc => {
                coaches[doc.data()['id']] = doc.data();
            });
            fs.collection("Groups").get().then(res =>{
                let data = [];
                res.forEach(doc => {
                    try{
                        let camperNames = "";
                        doc.data()['campers'].forEach(camperId => {
                            camperNames = ' "' + campers[camperId]['firstName'] + ' ' + campers[camperId]['lastName']+ '"';
                        });
                        data.push([
                        coaches[doc.data()['coach']]['firstName'] + " " + coaches[doc.data()['coach']]['lastName'] , 
                        camperNames,
                        `<button class='btn bdrlessBtn' onclick='getGroup("${doc.id}")'>Edit</button>`,
                        `<button class='btn bdrlessBtn btn-danger' onclick='removeGroup("${doc.id}")'>Remove</button>`
                        ]); 
                    }catch(err) {
                        console.log(err);
                        // DO nothing. Not a valid group.
                    }
                });
                $(document).ready(function() {
                    $('#groups').DataTable({        
                        data: data,
                        columns: [
                            {"title" : "Coach Name"},
                            {"title" : "Campers"},
                            {"title" : ""},
                            {"title" : ""}
                        ]
                    });
                });
            });
        });
    });
}

function updateGroupsTable(){
    $(document).ready(function() {
        $('#groups').DataTable().destroy();
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