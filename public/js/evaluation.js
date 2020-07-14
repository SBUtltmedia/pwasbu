class Evaluation {
    // Just an object to hold global variables
    constructor(camperID = "DEFAULT", evalMode = "add", docID = "DEFAULT", actID = "DEFAULT",
        instrID = "DEFAULT", evalID = "DEFAULT") {
        this.camperID = camperID;
        this.evalMode = evalMode;
        this.docID = docID;
        this.actID = actID;
        this.instrID = instrID;
        this.evalID = evalID;
        this.date = "";
    }
}
const currEval = new Evaluation(); //Current Evaluation Object
function initCampersEvalTable() {
    let user = firebase.auth().currentUser;
    let email = user.email;
    // $(document).ready(function() {
    //     $('#campers').DataTable({        
    //         columns: [
    //             {"title" : "First Name"},
    //             {"title" : "Last Name"},
    //             {"title" : "UID"},
    //             {"title" : ""},
    //             {"title" : ""}
    //         ]
    //     });
    // });
    try {
        let athletesTable = document.getElementById("campers");
        let campersTable = JSON.parse(localStorage.getItem('campers'))['0'];
        console.log(campersTable);
        for(i = 0; i < campersTable.length; i++) {
            createuserDetailsItem(athletesTable, campersTable[i]);
        }
    } catch(err) {
        let athletesTable = document.getElementById("campers");
        localStorage.setItem('campers', JSON.stringify({0:[]}));
        fs.collection("users").where("email","==", email).get().then(res=>{
            res.docs[0].ref.get().then(doc => {
                fs.collection("Groups").where("coach", "==", doc.data()['id']).get().then(res => {
                    res.docs[0].ref.get().then(doc => {
                        doc.data()['campers'].forEach(camper => {
                            fs.collection('users').where("id", "==", camper).get().then(res => {
                                res.docs[0].ref.get().then(doc => {
                                    // console.log(new Date(doc.data()["birthdate"]));
                                    // console.log("doc.data()['email']: ", doc.data()["email"]);
                                    let row = {
                                        name: doc.data()['firstName'] + " " + doc.data()['lastName'],
                                        age: parseInt(((new Date()) - (new Date(doc.data()["birthdate"]))) / (1000 * 60 * 60 * 24 * 365)),
                                        gender: doc.data()["gender"],
                                        pronouns: "She/Her/Hers", // This field needs to be added to the database
                                        team: "Purple Team", // This field needs to be added to the database
                                        id: doc.data()["id"],
                                        email: doc.data()["id"]
                                    };
                                    let campersData = JSON.parse(localStorage.getItem('campers'));
                                    campersData['0'].push(row);
                                    localStorage.setItem('campers', JSON.stringify(campersData));
                                    createuserDetailsItem(athletesTable, row);

                                    // let table = $('#campers').DataTable(); // Future improvements would use local storage caching
                                    // let row = [
                                    //     doc.data()['firstName'], 
                                    //     doc.data()['lastName'],
                                    //     doc.data()['id'],
                                    //     `<button class='btn bdrlessBtn' onclick='eval("${doc.data()['id']}", "get")'>Get Evals</button>`,
                                    //     `<button class='btn bdrlessBtn btn-danger' onclick='eval("${doc.data()['id']}", "add")'>Add Eval</button>`
                                    // ];
                                    // let campersData = JSON.parse(localStorage.getItem('campers'));
                                    // campersData['0'].push(row);
                                    // localStorage.setItem('campers', JSON.stringify(campersData));
                                    // table.row.add(row).draw();
                                });
                            });
                        });
                    });
                }).catch(err => { console.log(err); });
            });
        }).catch(err => { console.log(err); });
    }
}

function createuserDetailsItem(routerOutletElement, row) {
    // console.log(row);
    const matchedRoute = router._matchUrlToRoute(['userDetails']);
    matchedRoute.getTemplate(matchedRoute.params).then((userDetailsItem) => {
        userDetailsItem.content.querySelectorAll(".user-name")[0].innerHTML = row.name;
        userDetailsItem.content.querySelectorAll(".user-age")[0].innerHTML = row.age;
        userDetailsItem.content.querySelectorAll(".user-gender")[0].innerHTML = row.gender;
        userDetailsItem.content.querySelectorAll(".user-pronouns")[0].innerHTML = row.pronouns;
        userDetailsItem.content.querySelectorAll(".user-team")[0].innerHTML = row.team;

        userDetailsItem.content.querySelectorAll(".get-evals")[0].onclick = (event) => {eval(row['id'], "get")};
        userDetailsItem.content.querySelectorAll(".add-evals")[0].onclick = (event) => {eval(row['id'], "add")};

        let rowElem = document.createElement("tr");

        let imgCol = document.createElement("td");
        let detailsCol = document.createElement("td");
        let btnsCol = document.createElement("td");

        imgCol.classList.add("col-elem")
        detailsCol.classList.add("col-elem")
        btnsCol.classList.add("col-elem")

        // console.log("row.email: ", row.email);
        loadProfilePictureInElement(userDetailsItem.content.querySelectorAll(".user-img")[0], row.email);

        imgCol.appendChild(userDetailsItem.content.querySelectorAll(".img-col")[0]);
        detailsCol.appendChild(userDetailsItem.content.querySelectorAll(".details-col")[0]);
        btnsCol.appendChild(userDetailsItem.content.querySelectorAll(".btns-col")[0]);

        rowElem.appendChild(imgCol);
        rowElem.appendChild(detailsCol);
        rowElem.appendChild(btnsCol);
        
        routerOutletElement.appendChild(rowElem);
    });
}

function loadProfilePictureInElement(element, email) {
    // console.log(email);
    let listRef = storageRef.child(encodeURI(`users/${email}/profile-picture`));
    // console.log("Trying to get a file from " + email);
    listRef.listAll().then(function(res) {
        let profilePic = res.items[0];
        storageRef.child(encodeURI(`users/${email}/profile-picture/${profilePic.name}`)).getDownloadURL().then(function(url) {
            // console.log("Loading " + url + " as profile image");
            element.src = url;
        }).catch(function(error) {
            // console.log(error);
            element.src = '../img/user/default/user-480.png';
        });
    }).catch(function(error) {
        // console.log(error);
        // console.log("List all failed to work");
        element.src = '../img/user/default/user-480.png';
    });
};

function updateEval(camperID, _callback = () => {}) {
    try{
        let userData = JSON.parse(localStorage.getItem("userData"));
        currEval.instrID = userData['id'];
        currEval.camperID = camperID;
    } catch (err) {
        fs.collection("users").where('email', '==', user.email).get().then(function (res) {
            res.docs[0].ref.get().then(doc => {
                currEval.instrID = doc.data()['id'];
                _callback();
            });
        })
    }
}
function eval(id, evalMode = "add") {
    currEval.evalMode = evalMode;
    currEval.date = new Date().toDateInputValue();
    updateEval(id, router.loadRoute('evaluation'));
}
function actEvalInit() {
    fs.collection("Activities").get().then(res => {
        let data = [];
        res.forEach(doc => {
            data.push([
                `<button class='btn bdrlessBtn' onclick='loadNewEval("${doc.id}")'>${doc.data()['name']}</button>`
            ]);
        });
        $(document).ready(function () {
            $('#activities').DataTable({
                data: data,
                columns: [
                    { "title": "" }
                ]
            });
        });
    });
}
/**
 * Loads an Add evaluation form 
 */
function loadNewEval(docID = currEval.actID, _callback = () => { }) {
    currEval.actID = docID;
    if (currEval.evalMode == "add") {
        document.getElementById("activities").style = "display: none;";
        console.log(currEval.evalMode);
        $('#activities').DataTable().destroy();
    }
    document.getElementById("submitEval").style = "display: block;";
    return fs.collection("Activities").doc(docID).get().then(doc => {
        document.getElementById("activityName").innerHTML = doc.data()['name'];
        // Adding daily checklist
        $("#evaluation").append(`<div style="font-size: 2.5rem;"> Daily Check List </div>
                                <ul class="list-group" id="checklist"></ul>`);
        try {
            let day = 1;
            while (day < 4) {
                let itemID = 1;
                $("#checklist").append(`<a class="list-group-item list-group-item-action firstDropDownColor" 
                    data-toggle="collapse" href="#checklist-day-${day}" role="button" 
                    aria-expanded="false" aria-controls="checklist-day-${day}">
                    Day ${day} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="checklist-day-${day}">`);
                doc.data()['checklist'].forEach(item => {
                    $(`#checklist-day-${day}`).append(`<a class="list-group-item list-group-item-action secondDropDownColor" 
                    data-toggle="collapse" href="#${"checklist" + itemID + "-" + day}" role="button" 
                    aria-expanded="false" aria-controls="${"checklist" + itemID + "-" + day}">
                    ${item['name']} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="${"checklist" + itemID + "-" + day}">
                    <input type="number" id="${"checklist" + itemID + "-" + day}-input" > ${item['type']}
                    </div>`)
                    itemID++;
                });
                $("#checklist").append("</div>");
                day++;
            }
        } catch (err) {
            console.log("Checklist doesn't exist in this activity");
        }
        //Adding Skills
        $("#evaluation").append(`<div style="font-size: 2.5rem;"> Skills </div>
        <ul class="list-group" id="skills"></ul>`);
        try {
            let skillCount = 1;
            doc.data()['skills'].forEach(skill => {
                $("#skills").append(`<a class="list-group-item list-group-item-action firstDropDownColor" 
                    data-toggle="collapse" href="#skill-${skillCount}" role="button" 
                    aria-expanded="false" aria-controls="skill-${skillCount}">
                    ${skill['skillName']} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="skill-${skillCount}">`);
                let subSkillCount = 1;
                skill['subSkills'].forEach(subSkill => {
                    $(`#skill-${skillCount}`).append(`<a class="list-group-item list-group-item-action secondDropDownColor" 
                    data-toggle="collapse" href="#skill-${skillCount}-${subSkillCount}" role="button" 
                    aria-expanded="false" aria-controls="skill-${skillCount}-${subSkillCount}">
                    ${subSkill} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="skill-${skillCount}-${subSkillCount}">
                        <label for="skill-${skillCount}-${subSkillCount}-select">Score</label>
                        <select class="form-control" id="skill-${skillCount}-${subSkillCount}-select">
                        <option>Not Applicable</option>
                        <option>Partial Assistance</option>
                        <option>Total Assist</option>
                        <option>Independent</option>
                        <option>Visual Cue</option>
                        </select>
                        <label for="skill-${skillCount}-${subSkillCount}-comment">Comments</label>
                        <textarea class="form-control" id="skill-${skillCount}-${subSkillCount}-comment" rows="3"></textarea>
                    </div>`);
                    subSkillCount++;
                });
                $("#skills").append("</div>");
                skillCount++;
            });
        } catch (err) {
            console.log("skills does not exist in this activity");
        }
        _callback();
    });
}
function submitEval(evalID = "DEFAULT") {
    let evalDoc = {};
    fs.collection("Activities").doc(currEval.actID).get().then(doc => {
        evalDoc['activityName'] = doc.data()['name'];
        evalDoc['camper'] = currEval.camperID;
        evalDoc['dailyCheckList'] = { 1: [], 2: [], 3: [] };
        evalDoc['skills'] = {};
        evalDoc['date'] = currEval.date;
        evalDoc['instructor'] = currEval.instrID;
        try {
            let checkLen = doc.data()['checklist'].length;
            let day = 1;
            while (day < 4) {
                let itemID = 1;
                while (itemID < checkLen + 1) {
                    evalDoc['dailyCheckList'][day].push(document.getElementById(`${"checklist" + itemID + "-" + day}-input`).value);
                    itemID++;
                }
                day++;
            }
        } catch (err) {
            console.log(err);
            console.log("checklist does not exist when submitting for this activity");
        }
        try {
            let skillsLen = doc.data()['skills'].length;
            let skillCount = 1;
            while (skillCount < skillsLen + 1) {
                evalDoc['skills']['skill_' + skillCount] = [];
                let subSkillCount = 1;
                let subSkillsLen = doc.data()['skills'][skillCount - 1]['subSkills'].length;
                while (subSkillCount < subSkillsLen + 1) {
                    evalDoc['skills']['skill_' + skillCount].push({
                        score: document.getElementById(`skill-${skillCount}-${subSkillCount}-select`).value,
                        comment: document.getElementById(`skill-${skillCount}-${subSkillCount}-comment`).value
                    })
                    subSkillCount++;
                }
                skillCount++;
            }
        } catch (err) {
            console.log(err);
            console.log("skills does not exist when submitting for this activity")
        }
        if (currEval.evalMode == "add") {
            fs.collection("Evaluations").add(evalDoc).then(() => {
                alert("Evaluation added successfully!");
                router.loadRoute("home")
            });
        } else {
            //console.log(`The ID ${currEval.evalID} has been updated to ` + JSON.stringify(evalDoc));
            fs.collection("Evaluations").doc(currEval.evalID).set(evalDoc).then(() => {
                alert("Evaluation updated successfully!");
                router.loadRoute("home")
            });
        }
    });
}
function initEvalTable() {
    $('#evaluations').DataTable({
        columns: [
            { "title": "Activity Name" },
            { "title": "Instructor" },
            { "title": "Date" },
            { "title": "" },
            { "title": "" }

        ],
        "order": [[2, "desc"]]
    });
    fs.collection("users").where("priv", "==", "coach").get().then(resCoach => {
        coaches = {} // Dictionary of coachIDs
        resCoach.forEach(doc => {
            coaches[doc.data()['id']] = doc.data();
        });
        fs.collection("Evaluations").where("camper", "==", currEval.camperID).get().then(res => {
            let table = $('#evaluations').DataTable();
            res.forEach(doc => {
                try {
                    // console.log(coaches);
                    table.row.add([
                        doc.data()['activityName'],
                        coaches[doc.data()['instructor']]['firstName'] + " " + coaches[doc.data()['instructor']]['lastName'],
                        doc.data()['date'],
                        `<button class='btn bdrlessBtn' onclick='editEval("${doc.data()['activityName']}", 
                         "${doc.id}",${JSON.stringify(doc.data())});'>Edit</button>`,
                        `<button class='btn bdrlessBtn' onclick='removeEval("${doc.id}");'>Remove</button>`
                    ]);
                } catch (err) {
                    console.log(err);
                    console.log("Couldn't load the coach for the specified evaluation " + doc.id);
                }
            });
            table.draw();
        });
    });
}
function populateEval(evalDoc) {
    $(document).ready(function () {
        try {
            let checkLen = evalDoc['dailyCheckList'][1].length;
            let day = 1;
            while (day < 4) {
                let itemID = 1;
                while (itemID < checkLen + 1) {
                    console.log(`SOmething wrong with ${"checklist" + itemID + "-" + day}`);
                    document.getElementById(`${"checklist" + itemID + "-" + day}-input`).value = evalDoc['dailyCheckList'][day][itemID - 1];
                    itemID++;
                }
                day++;
            }
        } catch (err) {
            console.log(err);
            console.log("checklist does not exist in this Evaluation Document");
        }
        try {
            let skillsLen = Object.getOwnPropertyNames(evalDoc['skills']).length;
            let skillCount = 1;
            while (skillCount < skillsLen + 1) {
                let subSkillCount = 1;
                let subSkillsLen = evalDoc['skills']['skill_' + skillCount].length;
                while (subSkillCount < subSkillsLen + 1) {
                    document.getElementById(`skill-${skillCount}-${subSkillCount}-select`).value
                        = evalDoc['skills']['skill_' + skillCount][subSkillCount - 1]['score'];
                    document.getElementById(`skill-${skillCount}-${subSkillCount}-comment`).value
                        = evalDoc['skills']['skill_' + skillCount][subSkillCount - 1]['comment'];
                    subSkillCount++;
                }
                skillCount++;
            }
        } catch (err) {
            console.log(err);
            console.log("skills does not exist when submitting for this activity")
        }
    });
}
function editEval(actName, evalID, evalDoc) {
    currEval.evalID = evalID;
    currEval.evalDoc = evalDoc;
    currEval.instrID = evalDoc['instructor'];
    currEval.date = evalDoc['date'];
    fs.collection("Activities").where("name","==", actName).get().then(res=>{
        try {
            res.docs[0].ref.get().then(doc => {
                currEval.actID = doc.id;
                document.getElementById("evaluations").style="display: none;";
                $('#evaluations').DataTable().destroy();
                loadNewEval(doc.id).then(()=>{
                    populateEval(evalDoc);
                });
            });
        } catch(err) {
            console.log(err);
            alert("The activity : " + actName + " may have been deleted or no longer exist in the database");s
        }
    });
}
function removeEval(docID) {
    fs.collection("Evaluations").doc(docID).delete().then(() => {
        $('#evaluations').DataTable().clear();
        $('#evaluations').DataTable().destroy();
        initEvalTable();
    });
}