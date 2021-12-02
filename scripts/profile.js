// profile.js:
// * User Profile UI/UX code.
// * Assumes that `firebase_API.js` is loaded beforehand.
// * Assumes that it can access `firebase.firestore`

const db = firebase.firestore(app);

// The reference to the user's document
let currentUser;
// Access the user ID with currentUser.id
// (see https://firebase.google.com/docs/reference/js/v8/firebase.firestore.DocumentReference for all methods)

//Fill the profile with the data in fireDB.
async function populateInfo() {
	firebase.auth().onAuthStateChanged(user => {
		// Check if user is signed in:
		if (user) {
			//Assign UID to currentUser.
			currentUser = db.collection("users").doc(user.uid);

			//go to the correct user document by referencing to the user uid
			//get the document for current user.
			currentUser.onSnapshot(userDoc => {
				//get the data fields of the user
				let userName = userDoc.data().name;
				let userEmail = userDoc.data().email;
				let userBio = userDoc.data().bio;

				//if the data fields are not empty, then write them in to the form.
				if (userName != null) {
					document.getElementById("nameInput").value = userName;
					document.getElementById("nameText").textContent = userName;
				}
				if (userEmail != null) {
					document.getElementById("emailText").textContent = userEmail;
				}
				if (userBio != null) {
					document.getElementById("bioInput").value = userBio;
					document.getElementById("bioText").textContent = userBio;
				} else {
					document.getElementById("bioText").textContent = "Write a bit about yourself.";
				}
			});

			//Feed feature WIP: 
			// Start updating feed
			// db.collection("feed")
			// 	.where("user", "==", user.uid)
			// 	// .orderBy("timestamp") // needs composite index, cannot test right now
			// 	.onSnapshot(updateFeed);

			//List the goals of the currently signed-in user.
			listGoals();

		} else {
			// No user is signed in.
			console.log("No user is signed in");
		}
	});
}
// global state of animations per goal ID
lastAnimation = {};
populateInfo();

// TODO: documentation pass
function listGoals() {
	const userID = firebase.auth().currentUser.uid; // assume current user is logged in
	const goalContainer = document.getElementById("goal_container");
	db.collection('users').doc(userID).collection('goals').onSnapshot(
		(goals) => {
			// Clear existing goals on each update:
			goalContainer.innerHTML = "";

			// Append to a fragment
			goalFragment = document.createDocumentFragment();

			// Populate the section with goals
			goals.forEach((goal) => {
				const goalEl = document.createElement("div");
				const amountGoal = goal.data().amountGoal;
				const amount = goal.data().amount;
				goalEl.classList.add("goal");

				// The value for --progressbar-start-percent once we're done this animation
				let animationStartValue = 0;
				// Same for the finish:
				const animationFinishValue = Math.floor(amount / amountGoal * 100);

				// Look up whether this goal has a lastAnimation entry
				if (lastAnimation.hasOwnProperty(goal.id)) {
					// It does, so use it.
					animationStartValue = lastAnimation[goal.id];
				}
				lastAnimation[goal.id] = animationFinishValue;

				// Create goal bar element.
				goalEl.innerHTML = `
					<p id="${goal.id}-description" class="goal-description">${goal.data().description}</p>
					<input hidden type="text" id="${goal.id}-description-input" class="goal-description" value="${goal.data().description}"/>
					<svg class="progressbar" version="1.1" viewBox="0 0 100 200" preserveAspectRatio="none"
					style="--progressbar-start-percent:${animationStartValue}%; --progressbar-finish-percent:${animationFinishValue}%">
						<rect fill="#CCCCCC" stroke-width="10" x="0" y="0" width="100" height="200" />
						<rect class="progressbar-fill" fill="#50C878" stroke-width="10" x="0" y="0" width="100"
							height="200" />
					</svg>
					<div role="group" class="goal-smallinfo">
						<span class="goal-progress">
							<span id="${goal.id}-amount">${amount}</span>
							<span hidden id="${goal.id}-amount-input"><input class="amount-input" type="number" value="${amount}"></span>
							  / 
							<span id="${goal.id}-amountGoal">${amountGoal}</span>
							<span hidden id="${goal.id}-amountGoal-input"><input class="amountGoal-input" type="number" value="${amountGoal}"></span>
						</span>
						<span class="goal-deadline">
							Due by <span id="${goal.id}-dateEnd">${new Date(goal.data().dateEnd).toDateString()}</span>
								   <span hidden id="${goal.id}-dateEnd-input"><input class="dateEnd-input" type="date" value="${goal.data().dateEnd}"></input></span>
						</span>
					</div>
					<div class="goal-buttons">
						<button id="${goal.id}-inc-butt" class="btn btn-info" type="button" onclick="incrementGoal(\'${goal.id}\')">+1</button>
						<button hidden id="${goal.id}-save-edit-butt" class="btn btn-info" type="button" onclick="saveEditGoal(\'${goal.id}\')">Save Changes</button>
						<span>
							<button id="${goal.id}-edit-butt" class="btn btn-secondary" type="button" onclick="editGoal(\'${goal.id}\')">Edit</button>
							<button id="${goal.id}-delet-butt" class="btn btn-secondary" type="button" onclick="deleteGoal(\'${goal.id}\')">Delete</button>
						</span>
						</div>`;

				// Clean up animations once they finish
				goalEl.querySelector(".progressbar-fill").addEventListener("animationend",
					function () {
						finishPercent = goalEl.querySelector(".progressbar").style.getPropertyValue("--progressbar-finish-percent");
						goalEl.querySelector(".progressbar").style.setProperty("--progressbar-start-percent", finishPercent);
						this.classList.add("progress-anim-finished");
					}, false);
				goalFragment.appendChild(goalEl);
			});
			goalContainer.appendChild(goalFragment);
		}
	);
}

function editGoal(goalID) {
	// Hide the text fields.
	document.getElementById(goalID + "-description").hidden = true;
	document.getElementById(goalID + "-amount").hidden = true;
	document.getElementById(goalID + "-amountGoal").hidden = true;
	document.getElementById(goalID + "-dateEnd").hidden = true;
	document.getElementById(goalID + "-inc-butt").hidden = true;
	document.getElementById(goalID + "-edit-butt").hidden = true;
	document.getElementById(goalID + "-delet-butt").hidden = true;

	// Make visible the input fields.
	document.getElementById(goalID + "-description-input").hidden = false;
	document.getElementById(goalID + "-amount-input").hidden = false;
	document.getElementById(goalID + "-amountGoal-input").hidden = false;
	document.getElementById(goalID + "-dateEnd-input").hidden = false;
	document.getElementById(goalID + "-save-edit-butt").hidden = false;
}

function saveEditGoal(goalID) {
	// Hide the input and buttons.
	document.getElementById(goalID + "-description-input").hidden = true;
	document.getElementById(goalID + "-amount-input").hidden = true;
	document.getElementById(goalID + "-amountGoal-input").hidden = true;
	document.getElementById(goalID + "-dateEnd-input").hidden = true;
	document.getElementById(goalID + "-save-edit-butt").hidden = true;

	// Make visible the input fields and buttons.
	document.getElementById(goalID + "-description").hidden = false;
	document.getElementById(goalID + "-amount").hidden = false;
	document.getElementById(goalID + "-amountGoal").hidden = false;
	document.getElementById(goalID + "-dateEnd").hidden = false;
	document.getElementById(goalID + "-inc-butt").hidden = false;
	document.getElementById(goalID + "-edit-butt").hidden = false;
	document.getElementById(goalID + "-delet-butt").hidden = false;

	//TODO: Get goal reference. Set values of ref goal to values in input fields. 
	thisGoal = currentUser.collection('goals').doc(goalID);
	thisGoal.update({
		description: document.getElementById(goalID + "-description-input").value,
		dateEnd: document.getElementById(goalID + "-dateEnd-input").firstChild.value,
		amount: parseInt(document.getElementById(goalID + "-amount-input").firstChild.value),
		amountGoal: parseInt(document.getElementById(goalID + "-amountGoal-input").firstChild.value)
	});
}

function deleteGoal(goalID) {
	currentUser.collection('goals').doc(goalID).delete().then(() => {
		console.log("Delete successful for goal with ID=" + goalID)
	}).catch((error) => {
		console.error("Error deleting goal with ID=" + goalID + ", error: " + error)
	})
}

function incrementGoal(goalID) {
	thisGoal = currentUser.collection('goals').doc(goalID);
	thisGoal.get().then((goal) => {
		if (goal.data().amount < goal.data().amountGoal) {
			thisGoal.update({
				amount: goal.data().amount + 1
			})
		}

		// Update the animation
		lastAnimation[goalID] = Math.floor(goal.data().amount / goal.data().amountGoal * 100);
	});

	
}

// Feed feature WIP:
// Update feed with latest entries
// function updateFeed(entryCollection) {
// 	// Define references to DOM elements
// 	const entryList = document.getElementById("feed_entries");

// 	// Exit early if nothing is in the feed.
// 	if (entryCollection.empty) {
// 		return;
// 	}

// 	// Sort clientside to avoid composite indexes in Firestore
// 	const entries = entryCollection.docs
// 		// Dereference each entry and add a `date` field with a JS Date object based off the timestamp
// 		.map(doc => Object.assign({ date: new Date(doc.data().timestamp.seconds * 1000) }, doc.data()))
// 		// Sort in reverse chronological order
// 		.sort((a, b) => -(a.timestamp - b.timestamp));

// 	// Iterate and add to the document:
// 	const entryFrag = document.createDocumentFragment();
// 	// Bucket entries day-by-day
// 	const daysSeen = new Set();
// 	for (const entry of entries) {
// 		const day = entry.date.toDateString();
// 		// Never before seen date, so make a heading for it.
// 		if (!daysSeen.has(day)) {
// 			daysSeen.add(day);
// 			const dateHeading = document.createElement("li");
// 			dateHeading.innerHTML = `<h3>${entry.date.toLocaleDateString()}</h3>`;
// 			entryFrag.appendChild(dateHeading);
// 		}
// 		console.log("feed entry at ", entry.date, entry);
// 		const entryEl = document.createElement("li");
// 		entryFrag.appendChild(entryEl);

// 		db.collection("users")
// 			.doc(entry.user)
// 			.collection("goals")
// 			.doc(entry.goal)
// 			.get().then(doc => {
// 				const goal = doc.data();
// 				// TODO: support entries other than “added”
// 				entryEl.innerHTML = `<p>Added goal “${goal.description}”</p>`;
// 			});
// 	}
// 	entryList.appendChild(entryFrag);
// }

//--Username field editing-----------
//Enable editing for the username field.
function editProfile() {
	//Enable the info fields. Makes the name text invisible and
	//	turn the input on. 
	document.getElementById('nameField').disabled = false;
	document.getElementById('nameInput').hidden = false;
	document.getElementById('nameText').hidden = true;
	//Disappear the edit version of the button and appear the save version of the button.
	//Not currently working.
	document.getElementById('editProfile').hidden = true;
	document.getElementById('saveProfile').hidden = false;
}

//Save current form input into firebase. Disable editing of name form.
function saveProfile() {
	userName = document.getElementById('nameInput').value;

	currentUser.update({
		name: userName,
	}).then(() => {
		console.log("Name updated successfully.");
	});

	//Disable the form fields. Makes the input box invisible and
	//	turn the name text on.
	document.getElementById('nameField').disabled = true;
	document.getElementById('nameInput').hidden = true;
	document.getElementById('nameText').hidden = false;
	//Disappear the save version of the button and appear the edit version of the button.
	//Not currently working.
	document.getElementById('editProfile').hidden = false;
	document.getElementById('saveProfile').hidden = true;
}

//--Bio field editing----------
//Enable editing for bio field.
function editBio() {
	//Enable the form fields. Makes the paragraph text invisible and
	//	turn the form on.
	document.getElementById('bioField').disabled = false;
	document.getElementById('bioInput').hidden = false;
	document.getElementById('bioText').hidden = true;
	//Disappear the edit button and show the save button.
	document.getElementById('editBio').hidden = true;
	document.getElementById('saveBio').hidden = false;
}

//Save current form input to Firebase. Disable editing of bio field.
function saveBio() {
	userBio = document.getElementById("bioInput").value;

	//Update the Firebase.
	currentUser.update({
		bio: userBio
	}).then(() => {
		console.log("Bio successfully updated.");
	});

	//Disable editing of the form fields. Makes the form invisible and
	//	turns the paragraph text on.
	document.getElementById("bioField").disabled = true;
	document.getElementById('bioInput').hidden = true;
	document.getElementById('bioText').hidden = false;
	//Disappear the save button and show the edit button.
	document.getElementById('editBio').hidden = false;
	document.getElementById('saveBio').hidden = true;
}

//--New Goal feature-------

//Populate the 'Start Date' field in new goal with the current date.
today = new Date();
var YYYY = today.getFullYear();
var MM = today.getMonth() + 1;
var DD = today.getDate();
var todayRFC = YYYY + "-" + MM + "-" + DD;
document.getElementById('dateStartInput').value = todayRFC;

//Enable goal input interface.
function summonMakeGoal() {
	// document.getElementById('make_goal').hidden = false;
	userGoals = document.getElementById("user_goals");
	// userFeed = document.getElementById("feed");

	//Add the classes which pertain to this animation.
	userGoals.classList.add("make_goal_slideDown");
	// userFeed.classList.add("make_goal_slideDown");
	userGoals.addEventListener("animationiteration",
		function () {
			userGoals.classList.add("make_goal_uncovered");
			// userFeed.classList.add("make_goal_uncovered");
			//Remove the classes which pertain to the previous animation.
			userGoals.classList.remove("make_goal_slideDown");
			// userFeed.classList.remove("make_goal_slideDown");
		});
}

//Disable goal input interface. Clear form.
function dismissMakeGoal() {
	userGoals = document.getElementById("user_goals");
	// userFeed = document.getElementById("feed");

	//Add the classes which pertain to this animation.
	userGoals.classList.add("make_goal_slideUp");
	// userFeed.classList.add("make_goal_slideUp");

	userGoals.addEventListener("animationiteration",
		function () {
			//Remove the classes which pertain to the previous animation.
			userGoals.classList.remove("make_goal_uncovered");
			userGoals.classList.remove("make_goal_slideUp");
			// userFeed.classList.remove("make_goal_uncovered");
			// userFeed.classList.remove("make_goal_slideUp");
		});

	// document.getElementById('make_goal').hidden = true;
	document.getElementById('goalDescrip').value = "";
	document.getElementById('dateStartInput').value = todayRFC;
	document.getElementById('dateEndInput').value = "";
	document.getElementById('amountGoalInput').value = "0";
}


//Create a new goal document and store it in the database.
function makeGoal() {
	//Get values in input fields.
	goalDescrip = document.getElementById('goalDescrip').value;
	dateStart = document.getElementById('dateStartInput').value;
	dateEnd = document.getElementById('dateEndInput').value;
	amountGoal = document.getElementById('amountGoalInput').value;

	// If the fields are empty.
	if (goalDescrip.length == 0 || dateStart.length == 0 || dateEnd.length == 0 || amountGoal.value == 0) {
		document.getElementById("warning").style.display = 'block';
		setTimeout(function () {
			document.getElementById("warning").style.display = 'none';
		}, 3000);
		console.log("New goal not written to DB: empty values.");
		// Otherwise,
	} else {
		//Add new goal with generated ID.
		currentUser.collection("goals").add({
			description: goalDescrip,
			dateStart: dateStart,
			dateEnd: dateEnd,
			amount: 0,
			amountGoal: parseInt(amountGoal)
		})
			.then(() => {
				console.log("Goal created.");
			})
			.catch((error) => {
				console.error("Error creating goal: ", error);
			});
		dismissMakeGoal();
	}
}
