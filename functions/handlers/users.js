const { db, admin } = require('../utils/admin');
const config = require('../utils/config');
const { validateSignupData, validateLoginData, reduceUserDetails } = require('../utils/validators');
const firebase = require('firebase');
const busboy = require('busboy');
const { abort } = require('process');
firebase.initializeApp(config);


// signup a new user
exports.signup = (req, res) => {
	const { email, password, confirmPassword, handle } = req.body;
	// this is es6 syntax
	const newUser = { email, password, confirmPassword, handle }

	const { valid, errors } = validateSignupData(newUser);

	if (!valid) return res.status(400).json(errors);


	const noImg = 'no-img.png';
	let token, userId;
	db.doc(`/users/${newUser.handle}`).get()
		.then(doc => {
			if (doc.exists) {
				console.log('user already exists', doc.exists);
				return res.status(400).json({ handle: 'this handle is already taken' })
			} else {
				return firebase.auth()
					.createUserWithEmailAndPassword(newUser.email, newUser.password)
			}
		}).then(data => {
			userId = data.user.uid;
			return data.user.getIdToken();
		}).then(idToken => {
			token = idToken;
			const userCredentials = {
				handle: newUser.handle,
				email: newUser.email,
				createAt: new Date().toISOString(),
				imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
				userId: userId
			};

			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		}).then(() => {
			return res.status(201).json({ token });
		}).catch(err => {
			console.error(err);
			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).json({ email: "Email already in use" })
			} else {
				return res.status(500).json({ general: "Something went wrong" });
			}
		})

}

// log user in
exports.login = (req, res) => {
	const { email, password } = req.body;
	const user = { email, password }

	const { valid, errors } = validateLoginData(user);
	if (!valid) return res.status(400).json(errors);



	firebase.auth().signInWithEmailAndPassword(user.email, user.password)
		.then(data => {

			return data.user.getIdToken();
		}).then(token => {
			return res.json({ token });
		}).catch(err => {
			console.error(err);
			// auth/wrong-password
			// auth/user-not-ser
			// if (err.code === "auth/wrong-password") {
			return res.status(403).json({ general: 'Wrong credentials, please try again' })
			// } else return res.status(500).json({ error: err.code });
		})
}

// Add user details
exports.addUserDetails = (req, res) => {
	let userDetails = reduceUserDetails(req.body);
	console.log(">>>>>>>>>>>>", req.user.handle);
	db.doc(`/users/${req.user.handle}`).update(userDetails)
		.then(() => {
			return res.json({ message: 'Details added succesfully' });
		})
		.catch(err => {
			console.error(err);
			return res.status(500).json({ error: err.code })
		})
}

// get any user's details
exports.getUserDetails = (req, res) => {
	let userData = {};
	db.doc(`/users/${req.params.handle}`).get()
		.then(doc => {
			if (doc.exists) {
				userData.user = doc.data();
				return db.collection('screams').where('userHandle', '==', req.params.handle)
					.orderBy('createAt', 'desc').get();
			} else {
				return res.status(404).json({ error: 'user not found' })
			}
		}).then(data => {
			userData.screams = [];
			data.forEach(doc => {
				userData.screams.push({
					body: doc.data().body,
					createAt: doc.data().createAt,
					userHandle: doc.data().userHandle,
					userImage: doc.data().userImage,
					likeCount: doc.data().likeCount,
					commentCount: doc.data().commentCount,
					screamId: doc.id
				})
			})
			return res.json(userData)
		}).catch(err => {
			console.error(err);
			return res.status(500).json({ error: err.code })
		})
}
// get own user details
exports.getAuthenticatedUser = (req, res) => {
	let userData = {};
	db.doc(`/users/${req.user.handle}`).get()
		.then(doc => {
			if (doc.exists) {
				userData.credentials = doc.data();
				return db.collection('likes').where('userHandle', '==', req.user.handle).get()
			}
		}).then(data => {
			userData.likes = [];
			data.forEach(doc => {
				userData.likes.push(doc.data())
			})
			// 	return db.collection('notifications').where('recipient', '==', req.user.handle)
			// 		.orderBy('createAt', 'desc').limit(10).get()
			// })
			// .then(data => {
			// 	userData.notifications = [];
			// 	data.forEach(doc => {
			// 		userData.notifications.push({
			// 			recipient: doc.data().recipient,
			// 			sender: doc.data().sender,
			// 			createAt: doc.data().createAt,
			// 			screamId: doc.data().screamId,
			// 			type: doc.data().type,
			// 			read: doc.data().read,
			// 			notificationId: doc.id
			// 		})
			// 	});
			return res.json(userData)
		}).catch(err => {
			console.error(err);
			return res.status(500).json({ error: err.code })
		})

}
// upload a profile image for user
exports.uploadImage = (req, res) => {
	const BusBoy = require('busboy');
	const path = require('path');
	const os = require('os');
	const fs = require('fs');


	const busboy = BusBoy({ headers: req.headers })
	let imageFileName;
	let imageToBeUploaded = {};

	busboy.on('file', (fieldname, file, info) => {
		const { filename, encoding, mimeType } = info;
		if (mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
			return res.status(400).json({ error: 'Wrong file type submitted' });
		}

		const imageExtension = filename.split('.')[filename.split('.').length - 1];
		imageFileName = Math.round(Math.random() * 1000000000000).toString() + '.' + imageExtension;
		const filepath = path.join(os.tmpdir(), imageFileName);
		imageToBeUploaded = { filepath, mimeType };

		file.pipe(fs.createWriteStream(filepath));
	})

	busboy.on('finish', () => {
		admin.storage().bucket().upload(imageToBeUploaded.filepath, {
			resumable: false,
			metadata: {
				metadata: {
					contentType: imageToBeUploaded.mimeType
				}
			}
		}).then(() => {
			const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
			return db.doc(`/users/${req.user.handle}`).update({ imageUrl: imageUrl })
		}).then(() => {
			return res.json({ message: 'Image uploaded succesfully' })
		}).catch(err => {
			return res.status(500).json({ error: err.code })
		})
	})

	busboy.end(req.rawBody);

}

exports.markNotificationsRead = (req, res) => {
	let batch = db.batch();
	req.body.forEach(notificationId => {
		const notification = db.doc(`/notifications/${notificationId}`);
		batch.update(notification, { read: true });
	})

	batch.commit()
		.then(() => {
			return res.json({ message: 'Notifications marked read' });
		}).catch(() => {
			console.error(err);
			res.status(500).json({ error: err.code });
		})
}