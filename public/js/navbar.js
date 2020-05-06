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
    try{
          let userData = JSON.parse(localStorage.getItem("userData"));
          if(userData['priv'] != 'admin') {
            document.getElementById("nav-act").remove();
          }
        } catch(error){
            let user = firebase.auth().currentUser;
            fs.collection("users").where('email', '==', user.email).get().then(function(res) {
                if(res.docs.length > 0) {
                    res.docs[0].ref.get().then(doc=> {
                      if(doc.data()['priv'] != "admin") {
                        document.getElementById("nav-act").remove();
                      }
                    });
                } else {
                    document.getElementById("nav-act").remove();
                }
            }).catch((error)=>{
                console.log(error);
                document.getElementById("nav-act").remove();
            });
        }
  }