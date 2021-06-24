const socket = io();

// DOM selectors

const $messageForm = document.getElementById("message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $locationButton = document.getElementById("send-location");
const $messages = document.querySelector('#messages');

// template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
    console.log(msg.text);
    const html = Mustache.render(messageTemplate, {
      username: msg.username,  
      message: msg.text,
      createdAt: moment(msg.createdAt).format("h:mm a"),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on("locationMessage", (url)=>{
    console.log(url.text);
    const html = Mustache.render(locationTemplate, {
      username: url.username,
      location: url.text,
      createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const msg = $messageFormInput.value;
    socket.emit("newMsg", msg, () => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        console.log("message was delivered!!");
    });
});

$locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser!");
    }
    $locationButton.setAttribute("disabled", "disabled");
    navigator.geolocation.getCurrentPosition((position) => {
        const loc = {
            lat: position.coords.latitude,
            long: position.coords.longitude,
        };
        socket.emit("sendLocation", loc, () => {
            $locationButton.removeAttribute("disabled");
            console.log("location delivered!");
        });
    });
});

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
})

socket.on('roomData', ({ room, users })=>{
    console.log(room);
    console.log(users);

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.getElementById("sidebar").innerHTML = html;

})
