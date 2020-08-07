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
        this.selectedYear = new Date().getFullYear();
    }
}

const currEval = new Evaluation(); //Current Evaluation Object

function initCampersEvalTable() {
    let user = firebase.auth().currentUser;
    let email = user.email;

    let athletesTable = document.getElementById("campers");
    athletesTable.innerHTML = "";
    localStorage.setItem('campers', JSON.stringify({ 0: [] }));
    fs.collection("users").where("email", "==", email).get().then(res => {
        res.docs[0].ref.get().then(doc => {
            fs.collection("Groups").where("coach", "==", doc.data()['id']).get().then(res => {
                currEval.selectedYear = document.getElementById("yearPicker").value;
                // console.log("Selected Year: ", currEval.selectedYear);
                res.docs.forEach(doc => {
                    if(doc.data()['year'] == currEval.selectedYear) {
                        doc.data()['campers'].sort().forEach(camper => {
                            let rowElem = document.createElement("tr");
                            athletesTable.appendChild(rowElem);

                            fs.collection('users').where("id", "==", camper).orderBy("firstName", "desc").get().then(res => {
                                res.forEach(doc => {
                                    let row = {
                                        name: doc.data()['firstName'] + " " + doc.data()['lastName'],
                                        age: parseInt(((new Date()) - (new Date(doc.data()["birthdate"]))) / (1000 * 60 * 60 * 24 * 365)) || 0,
                                        gender: doc.data()["gender"],
                                        pronouns: doc.data()["pronoun"],
                                        team: "Purple Team", // This field needs to be added to the database
                                        id: doc.data()["id"],
                                        email: doc.data()["id"]
                                    };
                                    createUserDetailsItem(rowElem, row);
                                });
                            });
                        });
                    }
                });
            }).catch(err => { console.log(err); });
        });
    }).catch(err => { console.log(err); });
}

function createUserDetailsItem(rowElem, row) {
    const matchedRoute = router._matchUrlToRoute(['userDetails']);
    matchedRoute.getTemplate(matchedRoute.params).then((userDetailsItem) => {
        userDetailsItem.content.querySelectorAll(".user-name")[0].innerHTML = row.name;
        userDetailsItem.content.querySelectorAll(".user-age")[0].innerHTML = row.age;
        userDetailsItem.content.querySelectorAll(".user-gender")[0].innerHTML = row.gender;
        userDetailsItem.content.querySelectorAll(".user-pronouns")[0].innerHTML = row.pronouns;
        userDetailsItem.content.querySelectorAll(".user-team")[0].innerHTML = row.team;

        userDetailsItem.content.querySelectorAll(".add-evals")[0].onclick = (event) => { eval(row['id'], "get") };

        let imgCol = document.createElement("td");
        let detailsCol = document.createElement("td");
        let btnsCol = document.createElement("td");

        imgCol.classList.add("col-elem")
        detailsCol.classList.add("col-elem")
        btnsCol.classList.add("col-elem")

        loadProfilePictureInElement(userDetailsItem.content.querySelectorAll(".user-img")[0], row.email);

        imgCol.appendChild(userDetailsItem.content.querySelectorAll(".img-col")[0]);
        detailsCol.appendChild(userDetailsItem.content.querySelectorAll(".details-col")[0]);
        btnsCol.appendChild(userDetailsItem.content.querySelectorAll(".btns-col")[0]);

        rowElem.appendChild(imgCol);
        rowElem.appendChild(detailsCol);
        rowElem.appendChild(btnsCol);
    });
}

function loadProfilePictureInElement(element, email) {
    let listRef = storageRef.child(encodeURI(`users/${email}/profile-picture`));
    listRef.listAll().then(function (res) {
        let profilePic = res.items[0];
        storageRef.child(encodeURI(`users/${email}/profile-picture/${profilePic.name}`)).getDownloadURL().then(function (url) {
            element.src = url;
        }).catch(function (error) {
            element.src = '../img/user/default/user-480.png';
        });
    }).catch(function (error) {
        element.src = '../img/user/default/user-480.png';
    });
}

function updateEval(camperID, _callback = () => { }) {
    try {
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
    let table = document.getElementById("activities");
    fs.collection("users").where("priv", "==", "coach").get().then(resCoach => {
        coaches = {} // Dictionary of coachIDs
        resCoach.forEach(doc => {
            coaches[doc.data()['id']] = doc.data();
        });
        fs.collection("Activities").get().then(res => {
            let activities = {};
            res.forEach(doc => {
                activities[doc.data()['name']] = doc.id;
            });
            fs.collection("Evaluations").where("camper", "==", currEval.camperID).get().then(res => {
                listElements = {};
                res.forEach(doc => {
                    // if(doc.data()['date'].split("-")[0] == currEval.selectedYear) {
                    if(doc.data()['year'] == currEval.selectedYear && doc.data()['instructor'] == currEval.instrID) {
                        try {
                            let listElement = document.createElement("li");
                            let editButton = document.createElement("button");
                            editButton.classList.add("btn", "bdrlessBtn", "act-btns");
                            editButton.onclick = (evt) => {
                                currEval.evalMode = "get";
                                editEval("" + doc.data()['activityName'], "" + doc.id, doc.data());
                            }
                            editButton.innerHTML = doc.data()['activityName'];
                            listElement.appendChild(editButton);
                            listElements[doc.data()['activityName']] = listElement;
                            // table.appendChild(listElement);
                            if (activities.hasOwnProperty(doc.data()['activityName'])) {
                                delete activities[doc.data()['activityName']];
                            }
                        } catch (err) {
                            console.log(err);
                            console.log("Couldn't load the coach for the specified assessment " + doc.id);
                        }
                    }
                });

                Object.keys(activities).forEach(function (name) {
                    let listElement = document.createElement("li");
                    let editButton = document.createElement("button");
                    editButton.classList.add("btn", "bdrlessBtn", "act-btns");
                    editButton.onclick = (evt) => {
                        currEval.evalMode = "add";
                        loadNewEval(activities[name]);
                    }
                    editButton.innerHTML = name;
                    listElement.appendChild(editButton);
                    listElements[name] = listElement;
                    // table.appendChild(listElement);
                    // console.log(name, activities[name]);
                });

                Object.keys(listElements).sort().forEach(function(activityName) {
                    table.appendChild(listElements[activityName]);
                });
            });
        });
    });
}

/**
 * Loads an Add evaluation form 
 */
function loadNewEval(docID = currEval.actID, _callback = () => { }) {
    if(document.getElementById("quest")) {
        $("#quest").hide();
    }

    currEval.actID = docID;
    if (currEval.evalMode == "add") {
        document.getElementById("activities").style = "display: none;";
    }
    document.getElementById("submitEval").style = "display: block;";

    return fs.collection("Activities").doc(docID).get().then(doc => {
        document.getElementById("activityName").innerHTML = doc.data()['name'];
        // Adding daily checklist
        $("#evaluation").append(`<div class="sec-tit">Daily Check List</div>
                                <ul id="checklist">
                                    <li class="centeredRow">
                                        <button class="add-day-btn" onclick="addDay('${docID}')">
                                            Add Day
                                        </button>
                                    </li>
                                </ul>`);
        //Adding Skills
        $("#evaluation").append(`<div class="sec-tit">Skills</div>
                                <ul id="skills" class="skill-sec"></ul>`);
        try {
            let skillCount = 1;
            doc.data()['skills'].forEach(skill => {
                $("#skills").append(`<li>
                    <button class="btn bdrlessBtn evaluation-but" 
                        onclick="toggleHide('skill-${skillCount}');">
                        ${skill['skillName']}
                    </button>
                    <table id="skill-${skillCount}" class="hiddenElement skillz"></table></li>`);
                let subSkillCount = 1;
                skill['subSkills'].forEach(subSkill => {
                    $(`#skill-${skillCount}`).append(`<tr class="bordered-row change-color-on-hover">
                            <td class="padded-td">
                                <button class="bdrlessBtn bby-skill-btn" onclick="toggleHide('skill-${skillCount}-${subSkillCount}');">
                                ${subSkill}
                                </button>
                            </td>
                        </tr>
                        <tr id="skill-${skillCount}-${subSkillCount}" class="hiddenElement subskill bordered-row">
                            <td class="padded-td">
                                <table>
                                    <tr>
                                        <td><span>Score:</span></td>
                                        <td class="skll-score padded-td">
                                            <select class="form-control padded-input" id="skill-${skillCount}-${subSkillCount}-select">
                                            <option value="NA">Not Applicable</option>
                                            <option value="PA">Partial Assistance</option>
                                            <option value="TA">Total Assist</option>
                                            <option value="I">Independent</option>
                                            <option value="V.Cue">Visual Cue</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="skll-comm padded-td">
                                            <textarea class="form-control padded-input" id="skill-${skillCount}-${subSkillCount}-comment" rows="3" placeholder="Comments"></textarea>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>`);
                    subSkillCount++;
                });
                skillCount++;
            });
        } catch (err) {
            console.log("Skills does not exist in this activity: ", err);
        }
        _callback();
    });
}

function addDay(docID, _callback = (dates, day) => {}, dates = [], day = 0) {
    fs.collection("Activities").doc(docID).get().then(doc => {
        try {
            // let day = document.getElementsByClassName("day-btn").length + 1;
            let day = 1;
            while(document.getElementById("checklist-item-" + day)) {
                day++;
            }
            
            let itemID = 1;
            $("#checklist").append(
                `<li class="checklist-item" id="checklist-item-${day}">
                    <ul>
                        <button class="btn bdrlessBtn evaluation-but day-btn" onclick="toggleHide('checklist-day-${day}');">
                            <input id="day-${day}-date" type="date"></input>
                        </button>
                    </ul>
                    <ul>
                        <table id="checklist-day-${day}" class="hiddenElement sk-box">
                            <tr class="chcklst-sec bordered-row">
                                <td>
                                    <button class="remove-btn" onclick="removeDay(${day})">Delete Day</button>
                                </td>
                            </tr>
                        </table>
                    </ul>
                </li>`)
                .ready(() => {
                    _callback(dates, day);
                });
            doc.data()['checklist'].forEach(item => {
                $(`#checklist-day-${day}`).append(
                    `<tr class="chcklst-sec bordered-row">
                            <td class="padded-td">
                                <button class="bdrlessBtn bby-skill-btn" onclick="toggleHide('${'checklist' + itemID + '-' + day}-row');">
                                    ${item['name']}
                                </button>
                            </td> ` +
                                // <td class="chcklst-tit padded-td">${item['name']}</td>
                                // <td class="chcklst-inpt padded-td"><input type="number" min="0" id="${'checklist' + itemID + '-' + day}-input" class="padded-input"></td>
                                // <td class="chcklst-inpt padded-td"><span>${item['type']}</span></td>
                    `</tr>
                    <tr id="${'checklist' + itemID + '-' + day}-row" class="hiddenElement chcklst-sec bordered-row">
                        <td>
                            <table id="${'checklist' + itemID + '-' + day}" class="sk-box trials-row">
                                <tr id="${item['name'].split(" ").join("") + "-" + day}" class="subskill">
                                    <td>
                                        <button class="add-trial-btn" onclick="addTrial('${day}', '${itemID}', '${item['name']}', '${item['type']}')">
                                            Add Trial
                                        </button>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`);
                itemID++;
            });
        } catch (err) {
            console.log("Checklist doesn't exist in this activity: ", err);
        }
    });
}

function removeDay(day) {
    if(confirm("Are you sure you want to delete this day? NOTE: this action cannot be reversed.")) {
        // console.log("YES: " + day);
        document.getElementById('checklist-item-' + day).remove();
    } else {
        // console.log("NO: " + day);
    }
}

function addTrial(day, itemID, itemName, units, _callback = (day, itemID, items, trialNum) => {}, items = [], trialNum = 0) {
    document.getElementById(itemName.split(" ").join("") + "-" + day).remove();
    let trial = document.getElementsByClassName('checklist' + itemID + '-' + day + "-trial").length + 1;
    $(`#${'checklist' + itemID + '-' + day}`).append(
        `<tr id="${'checklist' + itemID + '-' + day + '-' + trial}" class="chcklst-sec ${'checklist' + itemID + '-' + day}-trial">
            <td class="chcklst-tit padded-td"><span>Trial #${trial}: </span></td>
            <td class="chcklst-inpt padded-td"><input type="number" min="0" id="${'checklist' + itemID + '-' + day + '-' + trial}-input" class="padded-input trial-input-${itemID}-${day}"></td>
            <td class="chcklst-inpt padded-td"><span>${units}</span></td>
            <td class="chcklst-inpt padded-td">
                <button class="remove-btn" onclick="removeTrial('${itemID}', '${day}', '${trial}');">X</button>
            </td>
        </tr>
        <tr id="${itemName.split(" ").join("") + "-" + day}" class="subskill">
            <td>
                <button class="add-trial-btn" onclick="addTrial('${day}', '${itemID}', '${itemName}', '${units}');">
                    Add Trial
                </button>
            </td>
        </tr>`
    ).ready(() => {
        _callback(day, itemID, items, trialNum);
    });
}

function removeTrial(itemID, day, trial) {
    document.getElementById('checklist' + itemID + '-' + day + '-' + trial).remove();
    let trials = document.getElementsByClassName('checklist' + itemID + '-' + day + "-trial");
    let trialNum = parseInt(trial);
    for(i = trialNum + 1; i <= trials.length + 1; i++) {
        document.getElementById('checklist' + itemID + '-' + day + '-' + i)
            .getElementsByClassName("chcklst-tit")[0].innerHTML = "Trial #" + (i - 1);
        document.getElementById('checklist' + itemID + '-' + day + '-' + i)
            .getElementsByClassName("remove-btn")[0].setAttribute("onclick", `removeTrial(${itemID}, ${day}, ${"" + (i - 1)});`);
        document.getElementById(`${'checklist' + itemID + '-' + day + '-' + i}-input`).id = `${'checklist' + itemID + '-' + day + '-' + (i - 1)}-input`;
        document.getElementById('checklist' + itemID + '-' + day + '-' + i).id = 'checklist' + itemID + '-' + day + '-' + (i - 1);
    }
}

function submitEval(evalID = "DEFAULT") {
    let evalDoc = {};
    fs.collection("Activities").doc(currEval.actID).get().then(doc => {
        evalDoc['activityName'] = doc.data()['name'];
        evalDoc['camper'] = currEval.camperID;
        evalDoc['dailyCheckList'] = {};
        evalDoc['skills'] = {};
        evalDoc['date'] = currEval.date;
        evalDoc['year'] = currEval.selectedYear;
        evalDoc['instructor'] = currEval.instrID;
        try {
            let checkLen = doc.data()['checklist'].length;
            let days = document.getElementsByClassName("checklist-item");
            for (let checklistItem of days) {
                let day = checklistItem.id.split("-")[2];
                let evalDate = document.getElementById(`day-${day}-date`).value;
                if(evalDate) {
                    if(evalDate.split("-")[0] == evalDoc['year']) {
                        if(!(evalDate in evalDoc['dailyCheckList'])) {
                            evalDoc['dailyCheckList'][evalDate] = {};
                            let itemID = 1;
                            while (itemID <= checkLen) {
                                evalDoc['dailyCheckList'][evalDate][itemID] = [];
                                let trials = document.getElementsByClassName(`trial-input-${itemID}-${day}`);
                                for (let trial = 1; trial <= trials.length; trial++) {
                                    evalDoc['dailyCheckList'][evalDate][itemID].push(document.getElementById(`${'checklist' + itemID + '-' + day + '-' + trial}-input`).value);
                                }
                                itemID++;
                            }
                        } else {
                            throw "There are multiple assessments on " + evalDate;
                        }
                    } else {
                        throw evalDate + " is not within the selected year of " + evalDoc['year'];
                    }
                } else {
                    throw "Every assessment must be filled out with a valid date";
                }
            }

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

            if (currEval.evalMode == "add") {
                fs.collection("Evaluations").add(evalDoc).then(() => {
                    alert("Evaluation updated successfully!");
                    router.loadRoute("home");
                });
            } else {
                fs.collection("Evaluations").doc(currEval.evalID).set(evalDoc).then(() => {
                    alert("Evaluation updated successfully!");
                    router.loadRoute("home");
                });
            }
        } catch (err) {
            alert("Could not successfully update this assessment: " + err);
        }
    });
}

function initEvalTable() {
    fs.collection("users").where("priv", "==", "coach").get().then(resCoach => {
        coaches = {} // Dictionary of coachIDs
        resCoach.forEach(doc => {
            coaches[doc.data()['id']] = doc.data();
        });
        fs.collection("Evaluations").where("camper", "==", currEval.camperID).get().then(res => {
            let table = document.getElementById("evaluations");
            res.forEach(doc => {
                try {
                    let listElement = document.createElement("li");
                    let editButton = document.createElement("button");
                    editButton.classList.add("btn", "bdrlessBtn", "act-btns");
                    editButton.onclick = (evt) => {
                        editEval("" + doc.data()['activityName'], "" + doc.id, doc.data());
                    }
                    editButton.innerHTML = doc.data()['activityName'];

                    listElement.appendChild(editButton);
                    table.appendChild(listElement);
                } catch (err) {
                    console.log("Couldn't load the coach for the specified assessment " + doc.id + ": ", err);
                }
            });
        });
    });
}

function populateEval(evalDoc, checklist) {
    $(document).ready(function () {
        try {
            let dates = Object.keys(evalDoc['dailyCheckList']);
            let days = dates.length;
            for(let day = 1; day <= days; day ++) {
                let populateDay = (dates, day) => {
                    document.getElementById(`day-${day}-date`).value = dates[day - 1];
                    let itemIDs = Object.keys(evalDoc['dailyCheckList'][dates[day - 1]]);
                    let items = evalDoc['dailyCheckList'][dates[day - 1]];
                    for(let itemID of itemIDs) {
                        let trials = items[itemID];
                        for(let trial = 1; trial <= trials.length; trial++) {
                            let populateTrial = (day, itemID, items, trialNum) => {
                                document.getElementById(`${'checklist' + itemID + '-' + day + '-' + trialNum}-input`).value = items[itemID][trialNum - 1];
                            }
                            addTrial(day, itemID, checklist[itemID - 1]['name'], checklist[itemID - 1]['type'], populateTrial, items, trial);
                        }
                        itemID++;
                    }
                }
                addDay(currEval.actID, populateDay, dates, day);
            }
        } catch (err) {
            console.log("Could not populate evaluation: ", err);
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
            console.log("Skills does not exist when submitting for this activity: ", err)
        }
    });
}

function editEval(actName, evalID, evalDoc) {
    currEval.evalID = evalID;
    currEval.evalDoc = evalDoc;
    currEval.instrID = evalDoc['instructor'];
    currEval.date = evalDoc['date'];
    fs.collection("Activities").where("name", "==", actName).get().then(res => {
        res.docs[0].ref.get().then(doc => {
            currEval.actID = doc.id;
            document.getElementById("evaluations").style = "display: none;";
            document.getElementById("activities").style = "display: none;";
            loadNewEval(doc.id).then(() => {
                populateEval(evalDoc, doc.data()['checklist']);
            });
        });
    });
}

function removeEval(docID) {
    fs.collection("Evaluations").doc(docID).delete().then(() => {
        $('#evaluations').DataTable().clear();
        $('#evaluations').DataTable().destroy();
        initEvalTable();
    });
}

function populateYearPicker() {
    let email = firebase.auth().currentUser.email;

    fs.collection("users").where("email", "==", email).get().then(res => {
        let coach = res.docs[0].data()['id'];
        let years = [];
        fs.collection("Groups").where("coach", "==", coach).get().then(res => {
            res.docs.forEach(group => {
                if(!years.includes(group.data()['year'])) {
                    years.push(group.data()['year']);
                }
            });
            years.sort();
            for(i = 0; i < years.length; i++) {
                $("#yearPicker").append(`<option value="${years[i]}">${years[i]}</option>`);
            }
            document.getElementById("yearPicker").value = new Date().getFullYear();
        });
    });
}





// fs.collection("Evaluations").get().then(function(querySnapshot) {
//     querySnapshot.forEach(function(doc) {
//         let checklistData = doc.data()['dataCheckList'];
//         let newChecklistData = {};
//     });
// });
