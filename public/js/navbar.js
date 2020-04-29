Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
function initNavBar(){
    console.log("debug - removing nav");
    try{
          let userData = JSON.parse(localStorage.getItem("userData"));
          if(userData['priv'] != "coach" && userData['priv'] != 'admin'){
            document.getElementById("nav-act").remove();
            document.getElementById("nav-camp").remove();
          }
          if(userData['priv'] != 'admin') {
            document.getElementById("nav-user").remove();
          }
        } catch(error){
            let user = firebase.auth().currentUser;
            fs.collection("users").where('email', '==', user.email).get().then(function(res) {
                if(res.docs.length > 0) {
                    res.docs[0].ref.get().then(doc=> {
                      if(doc.data()['priv'] == "admin") {
                        $("#nav-act").show();
                        $("#nav-camp").show();
                      }
                    });
                } else {
                    console.log("Please refresh to get an updated nav");
                    saveCurrentUserData();
                }
            }).catch((error)=>{
                console.log(error);
                document.getElementById("menu-user").innerHTML = "Please refresh to get an updated nav";
            });
        }
  }