const swalConfig = {
    icon: "info",
    html: "",
    toast: true,
    position: "top-end",
    iconColor: 'white',
    customClass: {
        popup: '',
        closeButton: 'text-white',
        icon: 'text-white',
    },
    showConfirmButton: false,
    showCloseButton: true,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
};

function formDataToUrlEncoded(formData) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        searchParams.append(key, value);
    }
    return searchParams.toString();
}

function is_valid(widget, valid) {
    if (valid) {
        widget.classList.remove("is-invalid");
        widget.classList.add("is-valid");
    } else {
        widget.classList.remove("is-valid");
        widget.classList.add("is-invalid");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const handleResponse = async (response) => {
        const data = await response.json();
        if (response.ok) {
            if (data.message) {
                swalConfig.icon = "success";
                swalConfig.customClass.popup = "bg-success text-white";
                swalConfig.html = data.message.replace("\n", "<br><br>");
                Swal.fire(swalConfig);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } else {
            if (data.error) {
                swalConfig.icon = "error";
                swalConfig.customClass.popup = "bg-danger text-white";
                swalConfig.html = data.error.replace("\n", "<br><br>");
                Swal.fire(swalConfig);
            }
        }
    };

    const formHandlers = {
        login: async (event) => {
            event.preventDefault();
            let valid = true;
            email = document.getElementById("InputEmail1");
            if (email.value.length > 6) {
                is_valid(email, true)
            } else {
                is_valid(email, false);
                valid = false
            }
            pass1 = document.getElementById("InputPassword1");
            if (pass1.value.length > 3) {
                is_valid(pass1, true)
            }
            else {
                is_valid(pass1, false);
                valid = false
            }
            if (!valid) {
                console.log("INVALID DATA")
                return;
            }
            const formData = new FormData(event.target);
            const encodedData = formDataToUrlEncoded(formData);
            const response = await fetch("/api/session/login", {
                method: "POST",
                body: encodedData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include"
            });
            handleResponse(response);
        },
        signup: async (event) => {
            event.preventDefault();
            let valid = true;
            firstName = document.getElementById("InputFirstName");
            if (firstName.value.length > 2) {
                is_valid(firstName, true)
            } else {
                is_valid(firstName, false);
                valid = false;
            }
            lastName = document.getElementById("InputLastName");
            if (lastName.value.length > 2) {
                is_valid(lastName, true)
            } else {
                is_valid(lastName, false);
                valid = false;
            }
            age = document.getElementById("InputAge");
            if (age.value.length > 1 && !isNaN(age.value)) {
                is_valid(age, true)
            } else {
                is_valid(age, false);
                valid = false;
            }
            email = document.getElementById("InputEmail1");
            if (email.value.length > 6) {
                is_valid(email, true)
            } else {
                is_valid(email, false);
                valid = false
            }
            pass1 = document.getElementById("InputPassword1");
            if (pass1.value.length > 3) {
                is_valid(pass1, true)
            }
            else {
                is_valid(pass1, false);
                valid = false
            }
            pass2 = document.getElementById("InputPassword2");
            if (pass2.value !== "" && pass1.value === pass2.value) {
                is_valid(pass2, true)
            } else {
                is_valid(pass2, false);
                valid = false;
            }
            if (!valid) {
                console.log("INVALID DATA")
                return;
            }
            const formData = new FormData(event.target);
            const encodedData = formDataToUrlEncoded(formData);
            const response = await fetch("/api/session/signup", {
                method: "POST",
                body: encodedData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include"
            });
            handleResponse(response);
        },
        recovery: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const encodedData = formDataToUrlEncoded(formData);
            const email = formData.get("email");
            if (!email) {
                swalConfig.icon = "error";
                swalConfig.customClass.popup = "bg-danger text-white";
                swalConfig.html = "Complete el correo electrónico";
                Swal.fire(swalConfig);
                return;
            }
            const response = await fetch("/api/session/recovery", {
                method: "POST",
                body: encodedData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include"
            });
            handleResponse(response);
        },
        passwordChange: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const token = event.target.dataset.token;
            const encodedData = formDataToUrlEncoded(formData);
            const response = await fetch(`/api/session/passwordChange/${token}`, {
                method: "POST",
                body: encodedData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: "include"
            });
            handleResponse(response);
        },
        profileUpload: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const response = await fetch(event.target.action, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            handleResponse(response);
        },
        identUpload: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const response = await fetch(event.target.action, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            handleResponse(response);
        },
        comDomicilioUpload: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const response = await fetch(event.target.action, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            handleResponse(response);
        },
        comCuentaUpload: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const response = await fetch(event.target.action, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            handleResponse(response);
        },
    };

    document.querySelectorAll("form").forEach((form) => {
        const handler = formHandlers[form.id];
        if (handler) {
            form.addEventListener("submit", handler);
        }
    });

    const logoutButton = document.getElementById('logoutButton')
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/session/logout', { method: 'GET' });
                handleResponse(response);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } catch (error) {
                console.error('Logout error:', error);
                swalConfig.icon = "error";
                swalConfig.customClass.popup = "bg-danger text-white";
                swalConfig.html = 'Error inesperado';
                Swal.fire(swalConfig);
            }
        });
    }

    const recoveryButton = document.getElementById('recovery-password')
    if (recoveryButton) {
        recoveryButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/session/recovery', { method: 'POST' });
                handleResponse(response);
            } catch (error) {
                console.error('Recovery error:', error);
                swalConfig.icon = "error";
                swalConfig.customClass.popup = "bg-danger text-white";
                swalConfig.html = 'Error inesperado';
                Swal.fire(swalConfig);
            }
        });
    }

    document.querySelectorAll(".borrar-usuario").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const userId = event.currentTarget.getAttribute("data-id");
            try {
                console.log(`Borrando ${userId}`)
                const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
                handleResponse(response);
                if (response.ok) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } catch (error) {
                console.error('Borrar usuario error:', error);
                swalConfig.icon = "error";
                swalConfig.customClass.popup = "bg-danger text-white";
                swalConfig.html = 'Error inesperado';
                Swal.fire(swalConfig);
            }
        });
    });

    document.querySelectorAll(".usuario-premium").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const userId = event.currentTarget.getAttribute("data-id");
            try {
                console.log(`Cambiar premium ${userId}`)
                const response = await fetch(`/api/users/premium/${userId}`, { method: "GET" });
                handleResponse(response);
                if (response.ok) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } catch (error) {
                console.error('Error al cambiar premium:', error);
                swalConfig.icon = "error";
                swalConfig.customClass.popup = "bg-danger text-white";
                swalConfig.html = 'Error inesperado';
                Swal.fire(swalConfig);
            }
        });
    });
});
