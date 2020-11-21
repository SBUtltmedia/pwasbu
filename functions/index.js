const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.deleteUser = functions.https.onCall( async (data, context) => {
    let email = data.email;
    try {
        userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().deleteUser(userRecord.uid);
        return "SUCCESS";
    } catch(err) {
        throw err;
    }
});
