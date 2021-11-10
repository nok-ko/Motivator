// feed.js:
// * Feed UI/UX code.
// * Assumes that `firebase_API.js` is loaded beforehand.
// * Assumes that it can access `firebase.firestore`

const db = firebase.firestore(app);

// Subscribe to feed updates from the database
function startFeedUpdates(userID) {
	db.collection("feeds").doc(userID).collection("entries").onSnapshot(entries => {
		entries.forEach(entry => {
			console.log("feed entry ", entry.data());
		});
	});
}


// First, log in…
firebase.auth().onAuthStateChanged(function (user) {
        if (user) { 
			// Now we have a reference to the logged in user!
			currentUserID = firebase.auth().currentUser.uid;
			// Update the feed with entries from the database:
			startFeedUpdates(currentUserID);
		}
	});
