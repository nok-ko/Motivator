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

// First, log in…
firebase.auth().onAuthStateChanged(function (user) {
        if (user) { 
			// Now we have a reference to the logged in user!
			// Update the page, list the goals of the currently signed-in user.
			listGoals();
		}
	});
