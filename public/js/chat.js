// This file is executed in the browser, when people visit /chat/<random id>

$(function () {

	// Initiating XMLHttpRequest Object:
	var http_request = initiateXMLHttpObject();


	// getting the id of the room from the url
	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	// connect to the socket
	var socket = io();

	// variables which hold the data for each person
	var name = "",
		email = "",
		img = "",
		friend = "";

	// cache some jQuery objects
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	// some more jquery objects
	var chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		hisName = $("#hisName"),
		hisEmail = $("#hisEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	// these variables hold images
	var ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");


	// on connection to server get the id of person's room
	socket.on('connect', function () {

		socket.emit('load', id);
	});

	// save the gravatar url
	socket.on('img', function (data) {
		img = data;
	});

	// receive the names and avatars of all people in the chat room
	socket.on('peopleinchat', function (data) {

		if (data.number === 0) {

			showMessage("connected");

			loginForm.on('submit', function (e) {

				e.preventDefault();

				name = $.trim(yourName.val());

				if (name.length < 1) {
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				email = yourEmail.val();

				if (!isValid(email)) {
					alert("Please enter a valid email!");
				}
				else {

					showMessage("inviteSomebody");

					// call the server-side function 'login' and send user's parameters
					socket.emit('login', { user: name, avatar: email, id: id });
				}

			});
		}

		else if (data.number === 1) {

			showMessage("personinchat", data);

			loginForm.on('submit', function (e) {

				e.preventDefault();

				name = $.trim(hisName.val());

				if (name.length < 1) {
					alert("Please enter a nick name longer than 1 character!");
					return;
				}

				if (name == data.user) {
					alert("There already is a \"" + name + "\" in this room!");
					return;
				}
				email = hisEmail.val();

				if (!isValid(email)) {
					alert("Wrong e-mail format!");
				}
				else {
					socket.emit('login', { user: name, avatar: email, id: id });
				}

			});
		}

		else {
			showMessage("tooManyPeople");
		}

	});

	// Other useful 

	socket.on('startChat', function (data) {
		console.log(data);
		if (data.boolean && data.id == id) {

			chats.empty();

			if (name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages", data);
			}
			else {

				showMessage("heStartedChatWithNoMessages", data);
			}

			chatNickname.text(friend);
		}
	});

	socket.on('leave', function (data) {

		if (data.boolean && id == data.room) {

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('tooMany', function (data) {

		if (data.boolean && name.length === 0) {

			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', function (data) {

		showMessage('chatStarted');

		if (data.msg.trim().length) {

			// Send chat message:
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();

			// Call S2V-IIA-Extension Modules:
			// Integrating to TTS:
			var action = [];

			responsiveVoice.speak((data.msg), "UK English Female");
			processMessage(data.user, data.msg, action);

			//alert("Msg is [" + msg + "]");

			if (action.length > 0) {

				responsiveVoice.speak(action[0], "UK English Male");

				setTimeout(function () {
					alert("API called [" + action[1] + "]");
					sendRequest(http_request, "POST", action[1], true);

				}, 7000);//Wait 7 seconds before showing up the alert message, to allow the UK English male to talk! 

			}
		}
	});

	textarea.keypress(function (e) {

		// Submit the form on enter

		if (e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function (e) {

		e.preventDefault();

		// Create a new chat message and display it directly

		showMessage("chatStarted");

		if (textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();

			// Send the message to the other person in the chat
			socket.emit('msg', { msg: textarea.val(), user: name, img: img });

		}
		// Empty the textarea
		textarea.val("");
	});

	// Update the relative time stamps on the chat messages every minute

	setInterval(function () {

		messageTimeSent.each(function () {
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	}, 60000);

	// Function that creates a new chat message

	function createChatMessage(msg, user, imgg, now) {

		var who = '';

		if (user === name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>' +
			'<div class="image">' +
			'<img src=' + imgg + ' />' +
			'<b></b>' +
			'<i class="timesent" data-time=' + now + '></i> ' +
			'</div>' +
			'<p></p>' +
			'</li>');

		// use the 'text' method to escape malicious user input
		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom() {
		$("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, 1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status, data) {

		if (status === "connected") {

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if (status === "inviteSomebody") {

			// Set the invite link content
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function () {
				inviteSomebody.fadeIn(1200);
			});
		}

		else if (status === "personinchat") {

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src", data.avatar);
		}

		else if (status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function () {
				inviteSomebody.fadeOut(1200, function () {
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src", data.avatars[1]);
		}

		else if (status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200, function () {
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src", data.avatars[0]);
		}

		else if (status === "chatStarted") {

			section.children().css('display', 'none');
			chatScreen.css('display', 'block');
		}

		else if (status === "somebodyLeft") {

			leftImage.attr("src", data.avatar);
			leftNickname.text(data.user);

			section.children().css('display', 'none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if (status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}

	function processMessage(name, message, action) {

		//alert("Processing a amessage");

//		var globalIPAddress = "192.168.1.76";
//		var globalIPAddress = "10.0.0.97";
		var globalIPAddress = "accs.oraclecloud.com";

		var globalPort = "3001";


		var SPHERO = "Sphero ",
			shape = "",
			colour = "",
			SQUARE = "Square",
			TRIANGLE = "Triangle",
			LINE = "Line",
			RED = "Red",
			YELLOW = "Yellow",
			BLUE = "Blue",
			GREEN = "Green",
			PINK = "Pink";



		// Assess if Sphero is being used as a command at the beginning.
		if (message.search(/SPHERO/i) != -1 && message.search(/SPHERO/i) == 0) {

			//alert("Sphero was found as a comand");

			if (message.search(/SQUARE/i) != -1) {

				shape = "square";

			} else if (message.search(/TRIANGLE/i) != -1) {

				shape = "triangle";

			} else if (message.search(/LINE/i) != -1) {

				shape = "line";

			}

			if (message.search(/RED/i) != -1) {

				colour = "red";

			} else if (message.search(/YELLOW/i) != -1) {

				colour = "yellow";

			} else if (message.search(/BLUE/i) != -1) {

				colour = "blue";

			} else if (message.search(/GREEN/i) != -1) {

				colour = "green";

			} else if (message.search(/PINK/i) != -1) {

				colour = "pink";
			}

			if (shape != "" && colour != "") {

				action[0] = "No worries " + name + ", I'll make a " + shape + " and turn " + colour;
				action[1] = "http://" + globalIPAddress + ":" + globalPort + "/sphero/shape/" + shape + "/color/" + colour;// Sphero make shape and set colour API!

			} else if (shape == "" && colour != "") {

				action[0] = "No worries " + name + ", I'll turn " + colour;
				action[1] = "http://" + globalIPAddress + ":" + globalPort + "/sphero/color/" + colour;// Sphero set colour API!

			}
		}
	}

	function sendRequest(http_request, verb, uri, async) {

		//alert("Debugging on: Sending [" + uri + "] under verb [" + verb + "]");

		http_request.open(verb, uri, async);
		http_request.setRequestHeader("Accept", "application/json");
		http_request.send();

		//alert("Your message was sent successfully.");
	}

	function initiateXMLHttpObject() {

		// Initiating XMLHttpRequest Object:
		var http_request;

		try {
			// Opera 8.0+, Firefox, Chrome, Safari
			http_request = new XMLHttpRequest();
		} catch (e) {
			// Internet Explorer Browsers
			try {
				http_request = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					http_request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
					// Something went wrong
					alert("Your browser broke!");
					return false;
				}
			}
		}

		return http_request;
	}

});