class Evaluation {
    constructor(camperID = "DEFAULT", evalMode = "add", docID = "DEFAULT", actID = "DEFAULT", instrID = "DEFAULT") {
        this.camperID = camperID;
        this.evalMode = evalMode;
        this.docID = docID;
        this.actID = actID;
        this.instrID = instrID;
    }
}
const currEval = new Evaluation(); //Current Evaluation Object
function initCampersEvalTable(){
    let user = firebase.auth().currentUser;
    let email = user.email;
    $(document).ready(function() {
        $('#campers').DataTable({        
            columns: [
                {"title" : "First Name"},
                {"title" : "Last Name"},
                {"title" : "UID"},
                {"title" : ""},
                {"title" : ""},
                {"title" : ""}
            ]
        });
    });
    fs.collection("users").where("email","==", email).get().then(res=>{
        res.docs[0].ref.get().then(doc => {
            fs.collection("Groups").where("coach", "==", doc.data()['id']).get().then(res=>{
                res.docs[0].ref.get().then(doc => {
                    doc.data()['campers'].forEach(camper => {
                        fs.collection('users').where("id", "==", camper).get().then( res =>{
                            res.docs[0].ref.get().then(doc => {
                                let table = $('#campers').DataTable(); // Future improvements would use local storage caching
                                table.row.add([
                                    doc.data()['firstName'], 
                                    doc.data()['lastName'],
                                    doc.data()['id'],
                                    `<button class='btn bdrlessBtn' onclick='eval("${doc.data()['id']}", "get")'>Get Evals</button>`,
                                    `<button class='btn bdrlessBtn btn-danger' onclick='eval("${doc.data()['id']}")', "edit">Edit Eval</button>`,
                                    `<button class='btn bdrlessBtn btn-danger' onclick='eval("${doc.data()['id']}", "add")'>Add Eval</button>`
                                ]).draw();
                            });
                        });
                    });
                });
            }).then(err=>{console.log(err);});
        });
    }).catch(err => { console.log(err);});
}
function updateEval(camperID, _callback = () => {}) {
    try{
        let userData = JSON.parse(localStorage.getItem("userData"));
        currEval.instrID = userData['id'];
        currEval.camperID = camperID;
    }catch(err){
        fs.collection("users").where('email', '==', user.email).get().then(function(res) {
            res.docs[0].ref.get().then(doc=> {
                currEval.instrID = doc.data()['id'];
                _callback();
            });
        })
    }
}
function eval(id, evalMode = "add"){
    currEval.evalMode = evalMode;
    updateEval(id, router.loadRoute('evaluation'));
}
function actEvalInit(){
    fs.collection("Activities").get().then(res =>{
        let data = [];
        res.forEach(doc => {
            data.push([
                `<button class='btn bdrlessBtn' onclick='loadEval("${doc.id}")'>${doc.data()['name']}</button>`
            ]);
        });
        $(document).ready(function() {
            $('#activities').DataTable({        
                data: data,
                columns: [
                    {"title" : ""}
                ]
            });
        });
    });
}
/**
 * Loads an evaluation form 
 */
function loadEval(docID = currEval.actID) {
    currEval.actID = docID;
    document.getElementById("activities").style="display: none;";
    $('#activities').DataTable().destroy();
    document.getElementById("submitEval").style="display: block;";
    fs.collection("Activities").doc(docID).get().then(doc => {
        document.getElementById("activityName").innerHTML = doc.data()['name'];
        // Adding daily checklist
        $("#evaluation").append(`<div style="font-size: large;"> Daily Check List </div>
                                <ul class="list-group" id="checklist"></ul>`);
        try{
            let day = 1;
            while(day < 4) {
                let itemID = 1;
                $("#checklist").append(`<a class="list-group-item list-group-item-action firstDropDownColor" 
                    data-toggle="collapse" href="#checklist-day-${day}" role="button" 
                    aria-expanded="false" aria-controls="checklist-day-${day}">
                    Day ${day} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="checklist-day-${day}">`);
                doc.data()['checklist'].forEach( item => {
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
        } catch(err){
            console.log("Checklist doesn't exist in this activity");
        }
        //Adding Skills
        $("#evaluation").append(`<div style="font-size: large;"> Skills </div>
        <ul class="list-group" id="skills"></ul>`);
        try{
            let skillCount = 1;
            doc.data()['skills'].forEach(skill=>{
                $("#skills").append(`<a class="list-group-item list-group-item-action firstDropDownColor" 
                    data-toggle="collapse" href="#skill-${skillCount}" role="button" 
                    aria-expanded="false" aria-controls="skill-${skillCount}">
                    ${skill['skillName']} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="skill-${skillCount}">`);
                let subSkillCount = 1;
                skill['subSkills'].forEach(subSkill=>{
                    $(`#skill-${skillCount}`).append(`<a class="list-group-item list-group-item-action secondDropDownColor" 
                    data-toggle="collapse" href="#skill-${skillCount}-${subSkillCount}" role="button" 
                    aria-expanded="false" aria-controls="skill-${skillCount}-${subSkillCount}">
                    ${subSkill} <i class="fas fa-angle-down rotate-icon"></i>
                    </a>
                    <div class="collapse" id="skill-${skillCount}-${subSkillCount}">
                        <label for="skill-${skillCount}-${subSkillCount}-select">Score</label>
                        <select class="form-control" id="skill-${skillCount}-${subSkillCount}-select">
                        <option>NA</option>
                        <option>PA</option>
                        <option>TA</option>
                        <option>IND.</option>
                        <option>V.CUE</option>
                        </select>
                        <label for="skill-${skillCount}-${subSkillCount}-comment">Comments</label>
                        <textarea class="form-control" id="skill-${skillCount}-${subSkillCount}-comment" rows="3"></textarea>
                    </div>`);
                    subSkillCount++;
                });
                $("#skills").append("</div>");
                skillCount++;
            });
        } catch(err){
            console.log("skills does not exist in this activity");
        }
    });
}
function submitEval(evalID = "DEFAULT"){
    if(currEval.evalMode == "add"){
        fs.collection("Activities").doc(currEval.actID).get().then(doc => { 
            let evalDoc = {};
            evalDoc['activityName'] = doc.data()['name'];
            evalDoc['camper'] = currEval.camperID;
            evalDoc['dailyCheckList'] = { 1:[],2:[],3:[]};
            evalDoc['skills'] = {};
            evalDoc['date'] = new Date().toDateInputValue();
            evalDoc['instructor'] = currEval.instrID;
            try{
                let checkLen = doc.data()['checklist'].length;
                let day = 1;
                while(day < 4){
                    let itemID = 1;
                    while(itemID < checkLen + 1) {
                        evalDoc['dailyCheckList'][day].push(document.getElementById(`${"checklist" + itemID + "-" + day}-input`).value);
                        itemID++;
                    }
                    day++;
                }
            } catch(err) {
                console.log(err);
                console.log("checklist does not exist when submitting for this activity");
            }
            try {
                let skillsLen = doc.data()['skills'].length;
                let skillCount = 1;
                while(skillCount < skillsLen + 1){
                    evalDoc['skills']['skill_'+skillCount] = [];
                    let subSkillCount = 1;
                    let subSkillsLen = doc.data()['skills'][skillCount - 1]['subSkills'].length;
                    while(subSkillCount < subSkillsLen + 1){
                        evalDoc['skills']['skill_'+skillCount].push({
                            score: document.getElementById(`skill-${skillCount}-${subSkillCount}-select`).value,
                            comment: document.getElementById(`skill-${skillCount}-${subSkillCount}-comment`).value
                        })
                        subSkillCount++;
                    }
                    skillCount++;
                }
            } catch(err) {
                console.log(err);
                console.log("skills does not exist when submitting for this activity")
            }
            console.log(evalDoc);
            // alert("Evaluation added successfully!");
            // router.loadRoute("home")
        });
    }
}