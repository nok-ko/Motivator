// profile.js:
// * User Profile UI/UX code.
// * Assumes that `firebase_API.js` is loaded beforehand.
// * Assumes that it can access `firebase.firestore`

const db = firebase.firestore(app);

// TODO: documentation pass
function listGoals() {
	const userID = firebase.auth().currentUser.uid; // assume current user is logged in
	const goalsContainer = document.getElementById("user_goals")

	// TODO: Show/hide “loading” message while we pull in data
	// TODO: live-update goals

	db.collection('users').doc(userID).collection('goals').get().then(
		(goals) => {
			goals.forEach((goal) => {
				const goalEl = document.createElement("div")
				const amountGoal = goal.data().amountGoal;
				const amount = goal.data().amount;
				goalEl.classList.add("goal");

				// FIXME I think this is questionable style, but… it's fast to implement
				goalEl.innerHTML = `
					<p class="goal-description">${goal.data().description}</p>
					<svg class="progressbar" version="1.1" viewBox="0 0 100 200" preserveAspectRatio="none"
					style="--progressbar-finish-percent:${Math.floor(amount / amountGoal * 100)}%"
					>
						<rect fill="#CCCCCC" stroke-width="10" x="0" y="0" width="100" height="200" />
						<rect class="progressbar-fill" fill="#888888" stroke-width="10" x="0" y="0" width="100"
							height="200" />
					</svg>
					<div role="group" class="goal-smallinfo">
						<span class="goal-progress">
							${amount}/${amountGoal}
						</span>
						<span class="goal-deadline">
							<!-- insert icon here -->
							Due by ${new Date(goal.data().dateEnd.seconds * 1000).toDateString()}
						</span>
					</div>`;

				// Clean up animations once they finish
				goalEl.querySelector(".progressbar-fill").addEventListener("animationend",
					function () {
						this.classList.add("progress-anim-finished")
					}, false);
				// TODO: use a DocumentFragment when appending?
				goalsContainer.appendChild(goalEl);
			})
		}
	);
}

var currentUser;
function populateInfo() {
	firebase.auth().onAuthStateChanged(user => {
		// Check if user is signed in:
		if (user) {
			// Now we have a reference to the logged in user!
			currentUser = db.collection("users").doc(user.uid);
			// Update the page, list the goals of the currently signed-in user.
			listGoals();

			//go to the correct user document by referencing to the user uid
			//get the document for current user.
			currentUser.onSnapshot(userDoc => {
				//get the data fields of the user
				var userName = userDoc.data().name;
				var userEmail = userDoc.data().email;
				var userBio = userDoc.data().bio;

				//if the data fields are not empty, then write them in to the form.
				if (userName != null) {
					document.getElementById("nameInput").value = userName;
					document.getElementById("nameText").textContent = userName;
				}
				// if (userEmail != null) {
				// 	document.getElementById("userEmail").value = userEmail
				// }
				if (userBio != null) {
					document.getElementById("bioInput").value = userBio;
					document.getElementById("bioText").textContent = userBio;
				}
			})
		} else {
			// No user is signed in.
			console.log("No user is signed in");
		}
	});
}
populateInfo();

//--Username field editing-----------
//Enable editing for the username field.
function editProfile() {
	//Enable the name fields. Makes the name text invisible and
	//	turn the input on. 
	document.getElementById('nameField').disabled = false;
	document.getElementById('nameInput').hidden = false;
	document.getElementById('nameText').hidden = true;
	//Disappear the edit version of the button and appear the save version of the button.
	//Not currently working.
	document.getElementById('editName').hidden = true;
	document.getElementById('saveName').hidden = false;
}

//Save current form input into firebase. Disable editing of name form.
function saveProfile() {
	userName = document.getElementById('nameInput').value;

	currentUser.update({
		name: userName
	}).then(() => {
		console.log(currentUser + " name updated successfully.")
	})

	//Disable the form fields. Makes the input box invisible and
	//	turn the name text on.
	document.getElementById('nameField').disabled = true;
	document.getElementById('nameInput').hidden = true;
	document.getElementById('nameText').hidden = false;
	//Disappear the save version of the button and appear the edit version of the button.
	//Not currently working.
	document.getElementById('editName').hidden = false;
	document.getElementById('saveName').hidden = true;
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
	})
		.then(() => {
			console.log("Document successfully updated!");
		})

	//Disable editing of the form fields. Makes the form invisible and
	//	turns the paragraph text on.
	document.getElementById("bioField").disabled = true;
	document.getElementById('bioInput').hidden = true;
	document.getElementById('bioText').hidden = false;
	//Disappear the save button and show the edit button.
	document.getElementById('editBio').hidden = false;
	document.getElementById('saveBio').hidden = true;
}
