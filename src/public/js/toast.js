const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let icon = "";
let message = "";
let bootstrapClass = "";

if (params.error) {
    icon = "error";
    message = params.error.replace("\n", "<br><br>");
    bootstrapClass = "bg-danger text-white"
} else if (params.success) {
    icon = "success";
    message = params.success.replace("\n", "<br><br>");
    bootstrapClass = "bg-success text-white"
} else if (params.message) {
    icon = "info";
    message = params.message.replace("\n", "<br><br>");
    bootstrapClass = "bg-primary text-white"
}

if (message) {
    const swalConfig = {
        icon: icon,
        html: message,
        toast: true,
        position: "top-end",
        iconColor: 'white',
        customClass: {
            popup: bootstrapClass,
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
    Swal.fire(swalConfig);
}