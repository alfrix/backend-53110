let userName;

function setUser(name) {
  console.log(name, new Date().toUTCString());
  userName = name;
}

function addMsg(name, msg, timestamp) {
  let ulChat = document.getElementById("chat");
  let card = '<li class="d-flex justify-content-between mb-4">';
  let avatar =
    '<i class="bi bi-person-circle m-3" style="font-size: 60px;"></i>';
  let message = `<div class="card w-100">
        <div class="card-header d-flex justify-content-between p-3">
            <p class="fw-bold mb-0">${name}</p>
            <p class="text-muted small mb-0"><i class="far fa-clock"></i> ${timestamp}</p>
        </div>
        <div class="card-body">
            <p class="mb-0">${msg}</p>
        </div>
    </div>`;
  if (name === userName) {
    card += avatar + message + "</li>";
  } else {
    card += message + avatar + "</li>";
  }
  ulChat.innerHTML = card + ulChat.innerHTML;
}

Swal.fire({
  title: "Identifiquese",
  input: "text",
  text: "Ingrese su nickname",
  inputValidator: (value) => {
    return !value && "Debe ingresar un nombre";
  },
  allowOutsideClick: false,
}).then((datos) => {
  console.log(datos);
  let name = datos.value;
  setUser(name);
  document.title = name;

  let inputMensaje = document.getElementById("message");
  inputMensaje.focus();

  const socket = io();

  socket.emit("welcome", name);

  socket.on("history", (messages) => {
    messages.forEach((m) => {
      addMsg(m.name, m.msg, m.timestamp);
    });
  });

  socket.on("newUser", (user) => {
    Swal.fire({
      title: `${user} se ha conectado`,
      toast: true,
      position: "top-right",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  });

  socket.on("newMessage", (name, msg, timestamp) => {
    addMsg(name, msg, timestamp);
  });

  socket.on("userDisconnect", (user) => {
    Swal.fire({
      title: `${user} ha salido del chat`,
      toast: true,
      position: "top-right",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  });

  inputMensaje.addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.code === "Enter" && e.target.value.trim().length > 0) {
      socket.emit("message", name, e.target.value.trim());
      e.target.value = "";
      e.target.focus();
    }
  });
});
