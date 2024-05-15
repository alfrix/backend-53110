document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll(".ajax-form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const url = this.action;
      const method = this.getAttribute("method").toUpperCase();
      const formData = new FormData(this);

      if (method === "DELETE") {
        fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              location.reload();
            } else {
              console.error("Error:", response.statusText);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        fetch(url, {
          method: method,
          body: formData,
        })
          .then((response) => {
            if (response.status != 200) {
              console.error(response.status, response.statusText);
              window.location.replace("/login");
            } else {
              window.location.replace(location.pathname);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
  });
});
