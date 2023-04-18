let input = document.querySelector('#msg');
let btn = document.querySelector('#chat-form');
let messages = document.querySelector('.chat-messages');
let room_name = document.querySelector('.room-name');
let users_Name = document.querySelector('#users');
let devo = document.querySelector('.devo');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
let socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsersName(users);
});

socket.on('message', (msg) => {
  outputMessage(msg);
});

socket.on('someMessage', (someMsg) => {
  showMsg(someMsg);
});

function showMsg(someMsg) {
  let h3 = document.createElement('h3');
  h3.classList.add('toast');
  h3.innerHTML = `( <i class="fas fa-info"></i> ) ${someMsg.text}`;
  devo.appendChild(h3);
  setTimeout(() => {
    h3.remove();
  }, 7000);
}

btn.addEventListener('click', (e) => {
  if (input.value === '') return;
  e.preventDefault();
  socket.emit('chatMessage', input.value);
  input.value = '';
});

function outputMessage(msg) {
  let h3 = document.createElement('h3');
  h3.classList.add('message');
  h3.innerHTML = `<h5 class="meta"> ${msg.username} <span>${msg.time}</span> </h5>
  <h4>${msg.text}</h4>`;
  messages.appendChild(h3);
}

function outputRoomName(room) {
  room_name.innerText = room;
}

function outputUsersName(users) {
  users_Name.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
}
