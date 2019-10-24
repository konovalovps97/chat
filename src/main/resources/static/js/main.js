'use strict';


var messageForm = document.getElementById('b');
var logoutElement = document.getElementById('logout');
var onlineUsersElement = document.getElementById('online-user');
var messageInput = document.querySelector('#message');
var connectingElement = document.querySelector('#connecting');


var stompClient = null;
var username = null;


function connect() {
    username = document.querySelector('#username').innerText.trim();
    localStorage.setItem("username", username);
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
}

// Connect to WebSocket Server.
connect();

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/publicChatRoom', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);
    var messageBox = document.getElementById('chat-message');
    if (message.type === 'JOIN') {
        if (message.sender !== '') {
            messageBox.innerHTML += "<p align='center'>К нам присоединился " + message.sender + "</p>";
        }
    } else if (message.type === 'LEAVE') {
        if (message.sender !== '') {
            messageBox.innerHTML += "<p align='center'>Нас покинул " + message.sender + "</p>";
        }
    } else {

        if (message.sender === localStorage.getItem("username")) {
            messageBox.innerHTML += " <div class=\"outgoing-chats\">\n" +
                "                            <div class=\"outgoing-chats-msg\">\n" +
                "                                <p>" + message.content + "</p>\n" +
                "                                <span class=\"time\">" + message.sender + "</span>\n" +
                "                            </div>\n" +
                "                            <div class=\"outgoing-chats-img\">\n" +
                "                                <img src=\"/static/img/avatar-2.png\" alt=\"Картинка человека\">\n" +
                "                            </div>\n" +
                "                        </div>";
        } else {
            messageBox.innerHTML += "       <div class=\"received-msg\">\n" +
                "                            <div class=\"received-msg-inbox\">\n" +
                "                                <p>" + message.content + "</p>\n" +
                "                                <span class=\"time\">" + message.sender + "</span>\n" +
                "   <div class=\"received-chats-img\">\n" +
                "                            <img src=\"/static/img/avatar-2.png\" alt=\"Картинка человека\">\n" +
                "                        </div>" +
                "                            </div>\n" +
                "                        </div>"
        }

        /*messageElement.classList.add('chat-message');
        var usernameElement = document.createElement('strong');
        usernameElement.classList.add('nickname');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);*/
    }

    /* var textElement = document.createElement('span');
     var messageText = document.createTextNode(message.content);
     textElement.appendChild(messageText);

     messageElement.appendChild(textElement);

     messageArea.appendChild(messageElement);
     messageArea.scrollTop = messageArea.scrollHeight;*/
}

function logout() {
    let username = document.getElementById('username').innerText;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'logout/' + username, true);
    xhr.send();
}

function getOnline() {
    var xhr = new XMLHttpRequest();



xhr.open('GET', 'onlineUsers', true);
xhr.send();
    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Список онлайн пользователей \n" + JSON.parse(xhr.responseText));
        }
    };
}

messageForm.addEventListener('click', sendMessage, true);
logoutElement.addEventListener('click', logout, true);
onlineUsersElement.addEventListener('click', getOnline, true);