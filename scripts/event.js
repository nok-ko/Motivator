// Get elements
var elements = {
    // Calendar element
    calendar: document.getElementById("events-calendar"),
    // Input element
    events: document.getElementById("events")
}

// Create the calendar
elements.calendar.className = "black-theme";
var calendar = jsCalendar.new(elements.calendar);

//Create events elements
elements.title = document.createElement("div");
elements.title.className = "title";
elements.events.appendChild(elements.title);
elements.subtitle = document.createElement("div");
elements.subtitle.className = "subtitle";
elements.events.appendChild(elements.subtitle);
elements.list = document.createElement("div");
elements.list.className = "list";
elements.list.id = "list";
elements.events.appendChild(elements.list);
elements.actions = document.createElement("div");
elements.actions.className = "action";
elements.events.appendChild(elements.actions);
elements.addButton = document.createElement("input");
elements.addButton.type = "button";
elements.addButton.value = "Add";
elements.addButton.className = "button";
elements.actions.appendChild(elements.addButton);

var events = {};
var date_format = "DD/MM/YYYY";
var current = null;

// Update the currently displayed events whenever Firestore is updated
firebase.auth().onAuthStateChanged(user => {
    // (only if we're logged in)
    if (user) {
        currentUser = db.collection("users").doc(user.uid);
        currentUser.collection("notes").onSnapshot((notes) => {
            // Reset!
            events = [];
            notes.forEach((note) => {
                let noteName = note.data().note;
                let noteDay = note.data().noteDay;

                // If no events, create list
                if (!events.hasOwnProperty(noteDay)) {
                    // Create list
                    events[noteDay] = [];
                }

                events[noteDay].push({
                    name: noteName
                });
                // Update the currently-displayed event :)
                showEvents(current);
            })
        })
    }
})

var showEvents = function (date) {
    // Date string
    var id = jsCalendar.tools.dateToString(date, date_format, "en");
    // Set date
    current = new Date(date.getTime());
    // Set title
    elements.title.textContent = id;
    // Clear old events
    elements.list.innerHTML = "";
    // Add events on list
    if (events.hasOwnProperty(id) && events[id].length) {
        // Number of events
        elements.subtitle.textContent = events[id].length + " " + ((events[id].length > 1) ? "events" :
            "event");

        var div;
        var close;
        // For each event
        for (var i = 0; i < events[id].length; i++) {
            div = document.createElement("div");
            div.className = "event-item";
            div.textContent = (i + 1) + ". " + events[id][i].name;
            elements.list.appendChild(div);
            close = document.createElement("div");
            close.className = "close";
            close.textContent = "×";
            div.appendChild(close);
            close.addEventListener("click", (function (date, index) {
                return function () {
                    removeEvent(date, index);
                }
            })(date, i), false);
        }
    } else {
        elements.subtitle.textContent = "No events";
    }
};

var removeEvent = function (date, index) {
    // Date string
    var id = jsCalendar.tools.dateToString(date, date_format, "en");

    // If no events return
    if (!events.hasOwnProperty(id)) {
        return;
    }
    // If not found
    if (events[id].length <= index) {
        return;
    }

    // Remove event
    events[id].splice(index, 1);

    // Refresh events
    showEvents(current);

    // If no events uncheck date
    if (events[id].length === 0) {
        calendar.unselect(date);
    }
}

// Show current date events
showEvents(new Date());

// Add events
calendar.onDateClick(function (event, date) {
    // Update calendar date
    calendar.set(date);
    // Show events
    showEvents(date);
});

elements.addButton.addEventListener("click", function () {
    document.getElementById("event-adder").hidden = false;
})

const db = firebase.firestore(app);

function addEvent() {
    // The new event's date, in a string
    var id = jsCalendar.tools.dateToString(current, date_format, "en");

    var noteValue = document.getElementById("event-description").value;

    //Add to firestore
    console.log("Adding Event at date: " + id + " with description: " + noteValue);
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            var currentUser = db.collection('users').doc(user.uid)
            currentUser.collection("notes").add({
                note: noteValue,
                noteDay: id
            }).then(_ => {
                console.debug("Just addded the event!", {
                    note: noteValue,
                    noteDay: id
                });
            });
        }
    });

    //Return on cancel
    if (noteValue === null || noteValue === "") {
        return;
    }

    //Add event + show event from the firebase

    // events[id].push({
    //     name: noteName
    // });

    // Refresh events
    //showEvents(current);
    document.getElementById("event-description").value = null;
    document.getElementById("event-adder").hidden = true;
}