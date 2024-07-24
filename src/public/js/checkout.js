document.addEventListener("DOMContentLoaded", () => {

    const checkoutButton = document.getElementById('checkout')
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async (event) => {
            const cartId = event.currentTarget.getAttribute("data-id");
            try {
                const response = await fetch(`/api/carts/${cartId}/purchase`, { method: 'GET' });
                const data = await response.json();
                if (response.ok) {
                    if (response.message) {
                        swalConfig.icon = "success";
                        swalConfig.customClass.popup = "bg-success text-white";
                        swalConfig.html = response.message.replace("\n", "<br><br>");
                        Swal.fire(swalConfig);
                    }
                    loadMercadoPago(cartId, data)
                } else {
                    if (response.error) {
                        swalConfig.icon = "error";
                        swalConfig.customClass.popup = "bg-danger text-white";
                        swalConfig.html = response.error.replace("\n", "<br><br>");
                        Swal.fire(swalConfig);
                    }
                    if (response.reload) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000)
                    }
                }
                console.log(response)
            } catch (error) {
                console.error(error);
            }
        });
    }
})

const loadMercadoPago = async (cartId, data) => {
    const mp = new MercadoPago(
        'APP_USR-38646504-42b6-4ce7-be49-7dbb2934df34', {
        locale: 'es-AR'
    });
    console.log("loadingMP")
    try {
        let response = await fetch(`/api/carts/${cartId}/pay`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Fallo al obtener la preferencia de pago');
        }

        let datos = await response.json();
        if (datos.error) {
            throw new Error(datos.error);
        }

        const bricksBuilder = mp.bricks();
        bricksBuilder.create("wallet", "wallet_container", {
            initialization: {
                preferenceId: datos.id,
            },
            customization: {
                texts: {
                    valueProp: 'smart_option',
                },
            },
            callbacks: {
                onError: (error) => console.error(error),
                onReady: () => { }
            }
        });

    } catch (error) {
        swalConfig.icon = "error";
        swalConfig.customClass.popup = "bg-danger text-white";
        swalConfig.html = error.message;
        Swal.fire(swalConfig);
    }
};


