/** @format */

//to display a container and hide others
function display(con) {
	var conList = [loginCon, inboxCon, sentCon, composeCon, draftCon];

	conList.forEach((item) => {
		if (item !== con) {
			item.style.display = "none";
		} else {
			item.style.display = "flex";
		}
	});
}

//to open sidebar
function openNav() {
	document.getElementById("gmSidepanel").style.width = "150px";
}

//to close sidebar
function closeNav() {
	document.getElementById("gmSidepanel").style.width = "0";
}

//to connect with gmail api

// Client ID and API key from the Developer Console
var CLIENT_ID = "425150083891-ou1hk0uvpealc0mlm629udh00c0hvj3r.apps.googleusercontent.com";

var API_KEY = "AIzaSyBlqx8m-xjQsVZWsKKp8gi3Ewi0DF7Xnw4";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES =
	"https://www.googleapis.com/auth/gmail.readonly" +
	" https://www.googleapis.com/auth/gmail.modify";

var authorizeButton = document.querySelector(".signin-btn");
var signoutButton = document.querySelector(".signout-btn");

var topBar = document.querySelector(".top-bar");
var bodyCon = document.querySelector(".body");
var loginCon = document.querySelector(".login-con");

var inboxCon = document.querySelector(".inbox-con");
var inboxTBodyElem = document.querySelector(".inbox-tbody");

var sentCon = document.querySelector(".sent-con");
var sentTBodyElem = document.querySelector(".sent-tbody");

var draftCon = document.querySelector(".draft-con");
var draftTBodyElem = document.querySelector(".draft-tbody");

var messageBodyCon = document.querySelector(".message-body-con");

var composeCon = document.querySelector(".compose-body-con");

var composeForm = document.querySelector(".compose-form");

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client
		.init({
			apiKey: API_KEY,
			clientId: CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES,
		})
		.then(
			function () {
				// Listen for sign-in state changes.
				gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

				// Handle the initial sign-in state.
				updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
				authorizeButton.onclick = handleAuthClick;
				signoutButton.onclick = handleSignoutClick;
			},
			function (error) {
				appendPre(JSON.stringify(error, null, 2));
			}
		);
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		topBar.style.display = "flex";

		getInbox();

		display(inboxCon);
	} else {
		topBar.style.display = "none";
		display(loginCon);
		clearInbox();
		clearSent();
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	var pre = document.querySelector(".body");
	var textContent = document.createTextNode(message + "\n");
	pre.appendChild(textContent);
}

//to display inbox-contents
function getInbox() {
	clearInbox();
	loadClient();
	executeGetInbox();

	display(inboxCon);
}

//to clear inbox on signout
function clearInbox() {
	while (inboxTBodyElem.firstChild) {
		inboxTBodyElem.removeChild(inboxTBodyElem.firstChild);
	}

	messageBodyCon.style.display = "none";

	InboxMsgFromList = [];
	InboxMsgSubList = [];
	InboxMsgDateList = [];
	InboxMsgBodyList = [];
	inboxMsgCount = 0;
}

function getSent() {
	clearSent();
	loadClient();
	executeGetSent();

	display(sentCon);
}

function clearSent() {
	while (sentTBodyElem.firstChild) {
		sentTBodyElem.removeChild(sentTBodyElem.firstChild);
	}

	messageBodyCon.style.display = "none";

	sentMsgToList = [];
	sentMsgSubList = [];
	sentMsgDateList = [];
	sentMsgBodyList = [];
	sentMsgCount = 0;
}

//to display draft contents
function getDraft() {
	clearDraft();
	loadClient();
	executeGetDraft();

	display(draftCon);
}

//to clear draft contents
function clearDraft() {
	while (draftTBodyElem.firstChild) {
		draftTBodyElem.removeChild(draftTBodyElem.firstChild);
	}

	draftMsgCount = 0;

	draftMsgToList = [];
	draftMsgSubList = [];
	draftMsgDateList = [];
	draftMsgBodyList = [];
}

//to set compose mail
function composeMail() {
	clearCompose();
	setCCBCCLinks();
	display(composeCon);
}

function clearCompose() {
	composeForm.reset();
}

function loadClient() {
	gapi.client.setApiKey(API_KEY);
	return gapi.client.load("https://gmail.googleapis.com/$discovery/rest?version=v1").then(
		function () {
			console.log("GAPI client loaded for API");
		},
		function (err) {
			console.error("Error loading GAPI client for API", err);
		}
	);
}

//---------to list mails in the inbox-------------------

// Make sure the client is loaded and sign-in is complete before calling this method.
function executeGetInbox() {
	return gapi.client.gmail.users.messages
		.list({
			userId: "dummymail8257@gmail.com",
		})
		.then(
			function (response) {
				// Handle the results here (response.result has the parsed body).

				var jResMessage = JSON.parse(response.body).messages;

				for (var i = 0; i < jResMessage.length; i++) {
					executeGetMessage(jResMessage[i].id);
				}
			},
			function (err) {
				console.error("Execute error", err);
			}
		);
}

var InboxMsgFromList = [];
var InboxMsgSubList = [];
var InboxMsgDateList = [];
var InboxMsgBodyList = [];

function executeGetMessage(id) {
	return gapi.client.gmail.users.messages
		.get({
			userId: "dummymail8257@gmail.com",
			id: id,
		})
		.then(
			function (response) {
				// Handle the results here (response.result has the parsed body).
				var jResponseBody = JSON.parse(response.body);
				var headers = jResponseBody.payload.headers;
				var [from, subject, date] = [" ", " ", " "];

				var snippet = jResponseBody.snippet;

				headers.forEach((header) => {
					if (header.name === "From") {
						from = header.value;
					} else if (header.name === "Subject") {
						subject = header.value;
					} else if (header.name === "Date") {
						date = header.value;
					}
				});

				if (jResponseBody.labelIds.indexOf("INBOX") != -1) {
					InboxMsgFromList.push(from);
					InboxMsgSubList.push(subject);
					InboxMsgDateList.push(date);
					InboxMsgBodyList.push(snippet);

					inboxCon.style.display = "flex";
					displayData(from, subject, date);
				}
			},
			function (err) {
				console.error("Execute error", err);
			}
		);
}

var inboxMsgCount = 0;

function displayData(from, subject, date) {
	var rowElem = document.createElement("tr");
	rowElem.setAttribute("onclick", `viewContent(event,${inboxMsgCount})`);

	var rowHead = document.createElement("th");
	rowHead.setAttribute("scope", "row");
	rowHead.innerText = ++inboxMsgCount;

	var fromDataElem = document.createElement("td");
	fromDataElem.innerText = from;

	var subjectDataElem = document.createElement("td");
	subjectDataElem.innerText = subject;

	var dateDataElem = document.createElement("td");
	dateDataElem.innerText = date;

	rowElem.append(rowHead, fromDataElem, subjectDataElem, dateDataElem);
	inboxTBodyElem.append(rowElem);
}

function viewContent(event, count) {
	var currentRowElem = event.target.parentElement;
	inboxCon.style.display = "none";

	clearMessageBody();
	messageBodyCon.style.display = "flex";

	var msgHTML = `<i class="fa fa-arrow-left left-icon" onclick="backToInbox()" aria-hidden="true"></i> 
    <p><b> From:  </b> ${InboxMsgFromList[count]} </p>
    <p><b> Subject:  </b>  ${InboxMsgSubList[count]}</p>
    <p><b> Date:  </b>  ${InboxMsgDateList[count]} </P>
    <p><b> Body:  </b> ${InboxMsgBodyList[count]} </p>`;

	messageBodyCon.innerHTML = msgHTML;
}

function clearMessageBody() {
	if (messageBodyCon) {
		while (messageBodyCon.firstChild) {
			messageBodyCon.removeChild(messageBodyCon.firstChild);
		}
	}
}

function backToInbox() {
	messageBodyCon.style.display = "none";
	inboxCon.style.display = "flex";
}

//---------------to list sent mails----------------------
var sentMsgToList = [];
var sentMsgSubList = [];
var sentMsgDateList = [];
var sentMsgBodyList = [];

function executeGetSent() {
	return gapi.client.gmail.users.messages
		.list({
			userId: "dummymail8257@gmail.com",
		})
		.then(
			function (response) {
				// Handle the results here (response.result has the parsed body).

				var jResMessage = JSON.parse(response.body).messages;

				for (var i = 0; i < jResMessage.length; i++) {
					executeGetSentMessage(jResMessage[i].id);
				}
			},
			function (err) {
				console.error("Execute error", err);
			}
		);
}

function executeGetSentMessage(id) {
	return gapi.client.gmail.users.messages
		.get({
			userId: "dummymail8257@gmail.com",
			id: id,
		})
		.then(
			function (response) {
				// Handle the results here (response.result has the parsed body).
				var jResponseBody = JSON.parse(response.body);

				var headers = jResponseBody.payload.headers;
				var [from, to, subject, date] = [" ", " ", " "];

				var snippet = jResponseBody.snippet;

				headers.forEach((header) => {
					if (header.name === "To") {
						to = header.value;
					} else if (header.name === "Subject") {
						subject = header.value;
					} else if (header.name === "Date") {
						date = header.value;
					}
				});

				if (jResponseBody.labelIds.indexOf("SENT") != -1) {
					sentMsgToList.push(to);
					sentMsgSubList.push(subject);
					sentMsgDateList.push(date);
					sentMsgBodyList.push(snippet);

					sentCon.style.display = "flex";
					displaySentData(to, subject, date);
				}
			},
			function (err) {
				console.error("Execute error", err);
			}
		);
}

var sentMsgCount = 0;

function displaySentData(to, subject, date) {
	var rowElem = document.createElement("tr");
	rowElem.setAttribute("onclick", `viewSentContent(event,${sentMsgCount})`);

	var rowHead = document.createElement("th");
	rowHead.setAttribute("scope", "row");
	rowHead.innerText = ++sentMsgCount;

	var toDataElem = document.createElement("td");
	toDataElem.innerText = to;

	var subjectDataElem = document.createElement("td");
	subjectDataElem.innerText = subject;

	var dateDataElem = document.createElement("td");
	dateDataElem.innerText = date;

	rowElem.append(rowHead, toDataElem, subjectDataElem, dateDataElem);
	sentTBodyElem.append(rowElem);
}

function viewSentContent(event, count) {
	var currentRowElem = event.target.parentElement;
	sentCon.style.display = "none";

	clearMessageBody();
	messageBodyCon.style.display = "flex";

	var msgHTML = `<i class="fa fa-arrow-left left-icon" onclick="backToSent()" aria-hidden="true"></i> 
    <p><b> To:  </b> ${sentMsgToList[count]} </p>
    <p><b> Subject:  </b>  ${sentMsgSubList[count]}</p>
    <p><b> Date:  </b>  ${sentMsgDateList[count]} </P>
    <p><b> Body:  </b> ${sentMsgBodyList[count]} </p>`;

	messageBodyCon.innerHTML = msgHTML;
}

function backToSent() {
	messageBodyCon.style.display = "none";
	sentCon.style.display = "flex";
}

//---------------to compose and send mail--------------

var ccFieldElem = document.querySelector("#compose-cc");
var bccFieldElem = document.querySelector("#compose-bcc");

var ccCon = document.querySelector(".cc-con");
var bccCon = document.querySelector(".bcc-con");

function setCCBCCLinks() {
	ccFieldElem.style.display = "none";
	bccFieldElem.style.display = "none";

	ccCon.style.display = "block";
	bccCon.style.display = "block";
}

function onccClick() {
	ccFieldElem.style.display = "block";
	ccCon.style.display = "none";
}

function onbccClick() {
	bccFieldElem.style.display = "block";
	bccCon.style.display = "none";
}

function sendMail(event) {
	event.preventDefault();
	document.querySelector(".send-btn").setAttribute("disabled", "true");

	var to = document.querySelector("#compose-to").value;
	var subject = document.querySelector("#compose-subject").value;
	var msg = document.querySelector("#compose-body").value;
	var cc = document.querySelector("#compose-cc").value;
	var bcc = document.querySelector("#compose-bcc").value;

	sendMessage({ To: to, Subject: subject, CC: cc, bcc: bcc }, msg);
}

function sendMessage(mailHeaders, msg) {
	if (draftId === " ") {
		var email = " ";
		for (var header in mailHeaders) {
			email += header += ": " + mailHeaders[header] + "\r\n";
		}

		email += "\r\n" + msg;

		return gapi.client.gmail.users.messages
			.send({
				userId: "dummymail8257@gmail.com",
				resource: {
					raw: window.btoa(email).replace(/\+/g, "-").replace(/\//g, "_"),
				},
			})
			.then(
				function (response) {
					var statusElem = document.querySelector(".mail-sent-status");
					if (response.status === 200) {
						document.querySelector(".compose-form").reset();
						statusElem.classList.add("bg-success");
						statusElem.style.display = "block";
						statusElem.innerHTML = `<p> Email sent Successfully </p>`;

						setTimeout(() => {
							statusElem.classList.remove("bg-success");
							statusElem.innerHTML = " ";
							statusElem.style.display = "none";
							document.querySelector(".send-btn").removeAttribute("disabled");
						}, 1800);
					} else {
						throw error;
					}
				},
				function (err) {
					var statusElem = document.querySelector(".mail-sent-status");
					setTimeout(() => {
						statusElem.classList.remove("bg-danger");
						statusElem.innerHTML = " ";
						statusElem.style.display = "none";
						document.querySelector(".send-btn").removeAttribute("disabled");
					}, 2000);

					console.error("Execute error", err);

					statusElem.classList.add("bg-danger");
					statusElem.style.display = "block";
					statusElem.innerHTML = `<p> Unable to send mail </p>`;
				}
			);
	} else {
		var email = " ";
		for (var header in mailHeaders) {
			email += header += ": " + mailHeaders[header] + "\r\n";
		}

		email += "\r\n" + msg;

		var dId = draftId;
		draftId = " ";

		return gapi.client.gmail.users.drafts
			.send({
				id: dId,
				userId: "dummymail8257@gmail.com",
			})
			.then(
				function (response) {
					var statusElem = document.querySelector(".mail-sent-status");
					if (response.status === 200) {
						document.querySelector(".compose-form").reset();
						statusElem.classList.add("bg-success");
						statusElem.style.display = "block";
						statusElem.innerHTML = `<p> Email sent Successfully </p>`;

						setTimeout(() => {
							statusElem.classList.remove("bg-success");
							statusElem.innerHTML = " ";
							statusElem.style.display = "none";
							document.querySelector(".send-btn").removeAttribute("disabled");
						}, 1800);
					} else {
						throw error;
					}
				},
				function (err) {
					var statusElem = document.querySelector(".mail-sent-status");
					setTimeout(() => {
						statusElem.classList.remove("bg-danger");
						statusElem.innerHTML = " ";
						statusElem.style.display = "none";
						document.querySelector(".send-btn").removeAttribute("disabled");
					}, 2000);

					console.error("Execute error", err);

					statusElem.classList.add("bg-danger");
					statusElem.style.display = "block";
					statusElem.innerHTML = `<p> Unable to send mail </p>`;
				}
			);
	}
}

//to save draft messages

function onSave(event) {
	event.preventDefault();

	document.querySelector(".save-btn").setAttribute("disabled", "true");

	var to = document.querySelector("#compose-to").value;
	var subject = document.querySelector("#compose-subject").value;
	var msg = document.querySelector("#compose-body").value;
	var cc = document.querySelector("#compose-cc").value;
	var bcc = document.querySelector("#compose-bcc").value;

	saveMessage({ To: to, Subject: subject, CC: cc, bcc: bcc }, msg);
}

function saveMessage(draftHeaders, msg) {
	var email = "";

	for (var header in draftHeaders) {
		email += header += ": " + draftHeaders[header] + "\r\n";
	}

	email += "\r\n" + msg;

	return gapi.client.gmail.users.drafts
		.create({
			userId: "dummymail8257@gmail.com",
			resource: {
				message: {
					raw: window.btoa(email).replace(/\+/g, "-").replace(/\//g, "_"),
				},
			},
		})
		.then(
			function (response) {
				var statusElem = document.querySelector(".mail-sent-status");
				if (response.status === 200) {
					document.querySelector(".compose-form").reset();
					statusElem.classList.add("bg-success");
					statusElem.style.display = "block";
					statusElem.innerHTML = `<p> Saved! </p>`;

					setTimeout(() => {
						statusElem.classList.remove("bg-success");
						statusElem.innerHTML = " ";
						statusElem.style.display = "none";
						document.querySelector(".save-btn").removeAttribute("disabled");
					}, 1800);
					console.log(response);
				} else {
					throw error;
				}
			},
			function (err) {
				var statusElem = document.querySelector(".mail-sent-status");
				setTimeout(() => {
					statusElem.classList.remove("bg-danger");
					statusElem.innerHTML = " ";
					statusElem.style.display = "none";
					document.querySelector(".save-btn").removeAttribute("disabled");
				}, 2000);

				console.error("Execute error", err);

				statusElem.classList.add("bg-danger");
				statusElem.style.display = "block";
				statusElem.innerHTML = `<p> Unable to save </p>`;
			}
		);
}

//-------------to list draft mails---------------

var draftMsgToList = [];
var draftMsgSubList = [];
var draftMsgDateList = [];
var draftMsgBodyList = [];

function executeGetDraft() {
	return gapi.client.gmail.users.drafts
		.list({
			userId: "dummymail8257@gmail.com",
		})
		.then(
			function (response) {
				// Handle the results here (response.result has the parsed body).
				if (response.result.resultSizeEstimate !== 0) {
					var jResMessage = response.result.drafts;
					var dId;

					for (var i = 0; i < jResMessage.length; i++) {
						dId = jResMessage[i].id;
						executeGetDraftMessage(jResMessage[i].message.id, dId);
					}
				}
			},
			function (err) {
				console.error("Execute error", err);
			}
		);
}

var dfId = " ";
function executeGetDraftMessage(id, dId) {
	return gapi.client.gmail.users.messages
		.get({
			userId: "dummymail8257@gmail.com",
			id: id,
		})
		.then(
			function (response) {
				// Handle the results here (response.result has the parsed body).
				var jResponseBody = JSON.parse(response.body);
				var headers = jResponseBody.payload.headers;
				var [to, subject, date] = [" ", " ", " "];

				var snippet = jResponseBody.snippet;

				headers.forEach((header) => {
					if (header.name === "To") {
						to = header.value;
					} else if (header.name === "Subject") {
						subject = header.value;
					} else if (header.name === "Date") {
						date = header.value;
					}
				});

				if (jResponseBody.labelIds.indexOf("DRAFT") != -1) {
					draftMsgToList.push(to);
					draftMsgSubList.push(subject);
					draftMsgDateList.push(date);
					draftMsgBodyList.push(snippet);

					draftCon.style.display = "flex";
					displayDraftData(to, subject, date, dId);
				}
			},
			function (err) {
				console.error("Execute error", err);
			}
		);
}

var draftMsgCount = 0;

function displayDraftData(to, subject, date, dId) {
	var rowElem = document.createElement("tr");
	rowElem.setAttribute("onclick", `composeContent(event,${draftMsgCount},"${dId}")`);

	var rowHead = document.createElement("th");
	rowHead.setAttribute("scope", "row");
	rowHead.innerText = ++draftMsgCount;

	var fromDataElem = document.createElement("td");
	fromDataElem.innerText = to;

	var subjectDataElem = document.createElement("td");
	subjectDataElem.innerText = subject;

	var dateDataElem = document.createElement("td");
	dateDataElem.innerText = date;

	rowElem.append(rowHead, fromDataElem, subjectDataElem, dateDataElem);
	draftTBodyElem.append(rowElem);
}

var draftId = " ";

function composeContent(event, count, dId) {
	var composeToField = document.querySelector("#compose-to");
	var composeSubjectField = document.querySelector("#compose-subject");
	var composeBodyField = document.querySelector("#compose-body");
	composeToField.value = draftMsgToList[count];
	composeSubjectField.value = draftMsgSubList[count];
	composeBodyField.value = draftMsgBodyList[count];

	setCCBCCLinks();
	display(composeCon);
	draftId = dId;
}
