const functions = require("firebase-functions");
const app = require('express')();
const fbAuth = require('./utils/fbAuth');
const {
    getAllScreams,
    postOneScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
} = require('./handlers/screams');
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    markNotificationsRead,
    getUserDetails
} = require('./handlers/users');
const { db } = require("./utils/admin");


// scream routes
app.get('/screams', getAllScreams)
app.post('/scream', fbAuth, postOneScream)
app.get('/scream/:screamId', getScream)
app.delete('/scream/:screamId', fbAuth, deleteScream)
app.get('/scream/:screamId/like', fbAuth, likeScream)
app.get('/scream/:screamId/unlike', fbAuth, unlikeScream)
app.post('/scream/:screamId/comment', fbAuth, commentOnScream)

// users routes
app.post('/signup', signup)
app.post('/login', login)
app.post("/user/image", fbAuth, uploadImage)
app.post('/user', fbAuth, addUserDetails)
app.get('/user', fbAuth, getAuthenticatedUser)
app.get('/user/:handle', getUserDetails);
app.post('/notifications', fbAuth, markNotificationsRead); // mark notifications as read

exports.api = functions.region('asia-south1').https.onRequest(app);

// create Notification on like
// exports.createNotificationOnLike = functions.region('asia-south1').firestore.document('likes/{id}')
//     .onCreate((snapshot) => {
//         console.log("snapshot.data()", snapshot.data());
//         return db.doc(`/screams/${snapshot.data().screamId}`).get()
//             .then(doc => {
//                 if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
//                     return db.doc(`/notifications/${snapshot.id}`).set({
//                         createAt: new Date().toDateString(),
//                         recipients: doc.data().userHandle,
//                         sender: snapshot.data().userHandle,
//                         type: 'like',
//                         read: false,
//                         screamId: doc.id,
//                     });
//                 }
//             }).catch(err => {
//                 console.error(err);
//             })
//     })

// // delete Notification on unlike
// exports.deleteNotificationOnUnLike = functions.region('asia-south1').firestore.document('likes/{id}')
//     .onDelete(snapshot => {
//         return db.doc(`/notifications/${snapshot.id}`).delete()
//             .catch((err) => {
//                 console.error(err);
//                 return;
//             })
//     })

// //  create  Notification on comment
// exports.createNotificationOnComment = functions.region('asia-south1').firestore.document('comments/{id}')
//     .onCreate((snapshot) => {
//         return db.doc(`/screams/${snapshot.data().screamId}`).get()
//             .then(doc => {
//                 if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
//                     return db.doc(`/notifications/${snapshot.id}`).set({
//                         createAt: new Date().toDateString(),
//                         recipients: doc.data().userHandle,
//                         sender: snapshot.data().userHandle,
//                         type: 'comment',
//                         read: false,
//                         screamId: doc.id,
//                     });
//                 }
//             }).catch(err => {
//                 console.error(err);
//                 return;
//             })
//     })


// on User image change, delete old image
// exports.onUserImageChange = functions.region('asia-south1').firestore.document('/users/{userId}')
//     .onUpdate((change) => {
//         console.log("change.before.data()", change.before.data());
//         console.log("change.after.data()", change.after.data());
//         if (change.before.data().imageUrl !== change.after.data().imageUrl) {
//             console.log('image has changed');
//             const batch = db.batch();
//             return db.collection('screams').where('userHandle', '==', change.before.data().handle).get()
//                 .then(data => {
//                     data.forEach((doc) => {
//                         const scream = db.doc(`/screams/${doc.id}`)
//                         batch.update(scream, { userImage: change.after.data().imageUrl });
//                     })
//                     return batch.commit()
//                 })
//         } else return true;
//     })

// on scream delete, delete all comments
// exports.onScreamDelete = functions.region('asia-south1').firestore.document('/screams/{screamId}')
//     .onDelete((snapshot, context) => {
//         const screamId = context.params.screamId;
//         const batch = db.batch();
//         return db.collection("comments").where('screamId', '==', screamId).get()
//             .then(data => {
//                 data.forEach(doc => {
//                     batch.delete(db.doc(`/comments/${doc.id}`));
//                 })
//                 return db.collection('likes').where('screamId', '==', screamId).get();
//             }).then(data => {
//                 data.forEach(doc => {
//                     batch.delete(db.doc(`/likes/${doc.id}`));
//                 })
//                 return db.collection('notifications').where('screamId', '==', screamId).get();
//             }).then(data => {
//                 data.forEach(doc => {
//                     batch.delete(db.doc(`/notifications/${doc.id}`));
//                 })
//                 return batch.commit();
//             }).catch(err => console.error(err))
//     }) 