class Evaluation {
    constructor(camperID = "DEFAULT", evalMode = "add", docID) {
        this.camperID = camperID;
        this.evalMode = evalMode;
        this.docID = docID;
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
                                    `<button class='btn bdrlessBtn' onclick='getEvals("${doc.data()['id']}")'>Get Evals</button>`,
                                    `<button class='btn bdrlessBtn btn-danger' onclick='editEval("${doc.data()['id']}")'>Edit Eval</button>`,
                                    `<button class='btn bdrlessBtn btn-danger' onclick='eval("${doc.data()['id']}")'>Add Eval</button>`
                                ]).draw();
                            });
                        });
                    });
                });
            }).then(err=>{console.log(err);});
        });
    }).catch(err => { console.log(err);});
}
function eval(id){
    currEval.camperID = id;
    currEval.evalMode = "add";
    router.loadRoute('evaluation');
}
function getEvals(id){
    currEval.camperID = id;
    currEval.evalMode = "get";
    router.loadRoute('evaluation');
}
function editEvals(id){
    currEval.camperID = id;
    currEval.evalMode = "edit";
    router.loadRoute('evaluation');
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
function loadEval(docID) {
    document.getElementById("activities").style="display: none;";
    $('#activities').DataTable().destroy();
    document.getElementById("submitEval").style="display: block;";
    fs.collection("Activities").doc(docID).get().then(doc => {
        document.getElementById("activityName").innerHTML = doc.data()['name'];
    });
}
function submitEval(){

}