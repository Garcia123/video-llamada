
var myVideoTag = document.querySelector("#myVideoTag");
var theirVideoTag = document.querySelector("#theirVideoTag");


//var videoSelect = document.querySelector("#camera");
var myName = document.querySelector("#myName");
var myMessage = document.querySelector("#myMessage");
var sendMensaje = document.querySelector("#sendMensaje");
var chatArea = document.querySelector("#chatArea");
var signalingArea = document.querySelector("#signalingArea");

var ROOM = "chat";
var SIGNAL_ROOM = "signal_room";

var configuration = {
   'iceServers': [{ "url": "stun:stun.sipgate.net:3478" }]
};
var rtcPeerConn;

io = io.connect();   // nos conectamos a sokect IO
io.emit('ready', { "chat_room": ROOM, "signal_room": SIGNAL_ROOM }); // emitimos las dos salas 

// evimitmos para la signaling
io.emit('signal', { "type": "user_here", "message": "¿estás listo para una llamada?", "room": SIGNAL_ROOM });

io.on('signaling_mensaje', (data) => {

   displaySegnalMessage("señal recibida :" + data.type);
   console.info("signaling_mensaje => ", data);

   if (!rtcPeerConn)
      startSignaling();

   if (data.type != "user_here") {

      var message = JSON.parse(data.message);

      if (mensaje.sdp) {
         rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
            if (rtcPeerConn.remoteDescription.type == "offer") {
               rtcPeerConn.createAnswer(sendLocalDesc, logError);
            }
         }, logError);
      } else {
         rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
      }

   }
});

io.on('announce', (data) => {
   console.log(" escuchar announce ", data);
   displayMessage(data.message);
});

io.on('message', (data) => {
   displayMessage(data.author + " : " + data.message);
});

function startSignaling() {

   displaySegnalMessage("comenzando a señalar...");
   rtcPeerConn = new webkitRTCPeerConnection(configuration);

   rtcPeerConn.onicecandidate = function (event) {
      debugger;
      console.log("rtcPeerConn ( onicecandidate )", event);

      if (event.candidate) {
         io.emit('signal', {
            "type": "ice candidate",
            "message": JSON.stringify({ 'candidate': event.candidate }),
            "room": SIGNAL_ROOM
         });
         displaySegnalMessage("complete that ice candidate...");
      }
   };

   rtcPeerConn.onnegotiationneeded = function () {
      displaySegnalMessage("en la negociación llamada");
      console.log("rtcPeerConn ( onnegotiationneeded )");
      rtcPeerConn.createOffer(sendLocalDesc, logError);
   }

   rtcPeerConn.onaddstream = function (event) {
      displaySegnalMessage("va a agregar su secuencia ...");
      console.info("rtcPeerConn ( onaddstream )", event);
      theirVideoTag.src = URL.createObjectURL(event.stream);
   }

   navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
   navigator.getUserMedia({ "audio": true, "video": true }, (stream) => {
      displaySegnalMessage("va a mostrar mi secuencia...");
      myVideoTag.src = URL.createObjectURL(stream);
   }, logError);

}

function sendLocalDesc(desc) {

   rtcPeerConn.setLocalDescription(desc, () => {
      displayMessage("sending local descripcion");
      io.emit("signal", {
         "type": "sdp",
         "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }),
         "room": SIGNAL_ROOM
      });
   }, logError);
}

function logError(error) {
   console.info.error("error ", error);
   displaySegnalMessage(error.name + " : " + error.mensaje);
}

sendMensaje.addEventListener("click", (event) => {
   io.emit("send", { "author": myName.value, "message": myMessage.value });
   event.preventDefault();
}, false);

function displayMessage(mensaje) {
   chatArea.innerHTML = chatArea.innerHTML + "<br/>" + mensaje;
}

function displaySegnalMessage(mensaje) {
   signalingArea.innerHTML = signalingArea.innerHTML + "<br/>" + mensaje;
}
