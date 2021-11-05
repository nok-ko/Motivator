// profile.js:
// * User Profile UI/UX code.
// * Assumes that `firebase_API.js` is loaded beforehand.
// * Assumes that it can access `firebase.firestore`

const db = firebase.firestore(app);

// class Goal {
// 	static fromDocument(doc) {
// 		const goal = new Goal();
// 		goal.description = doc.
// 	}
// }

// TODO: documentation pass
function listGoals() {
	const userID = firebase.auth().currentUser.uid; // assume current user is logged in
	const goalsContainer = document.getElementById("user_goals")

	console.log("listing goals")
	db.collection('users').doc(userID).collection('goals').get().then(
		(goals) => {
			console.log("goals?")
			console.log(goals)
			goals.forEach((goal) => {
				console.log("goal?")
				console.log(goal.data())
				const goalEl = document.createElement("div")
				const amountGoal = goal.data().amountGoal;
				const amount = goal.data().amount;
				goalEl.classList.add("goal");
				
				// FIXME I think this is questionable style, but… it's fast to implement
				goalEl.innerHTML = `
					<p class="goal-description">${goal.data().description}</p>
					<svg class="progressbar" version="1.1" viewBox="0 0 100 200" preserveAspectRatio="none"
					style="--progressbar-finish-percent:${Math.floor(amount/amountGoal * 100)}%"
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
							Due by ${new Date(goal.data().dateEnd.seconds*1000).toDateString()}
						</span>
					</div>`
				goalEl.querySelector(".progressbar-fill").addEventListener("animationend", onEnd, false);
				goalsContainer.appendChild(goalEl); //TODO: use a fragment here
			})
			// console.log(next);
		}
	);

	// Clean up animations once they finish
	function onEnd() {
		this.classList.add("progress-anim-finished")
		console.log(this)
	}
}

// First, log in…
firebase.auth().onAuthStateChanged(function (user) {
		console.log("auth state changed ")
		console.log(firebase.auth().currentUser.uid)
        if (user) { 
			// Now we have a reference to the logged in user!
			// Update the page, list the goals of the currently signed-in user.
			listGoals();
		}
	});
