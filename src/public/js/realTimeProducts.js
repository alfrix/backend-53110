const socket = io();
req.logger.debug("Script start");
socket.emit("getProducts");

function createCard(product) {
  let cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  let title = document.createElement("h5");
  title.classList.add("card-title");
  title.innerHTML = product.title;
  cardBody.appendChild(title);

  let des = document.createElement("p");
  des.classList.add("card-text");
  des.innerHTML = product.description;
  cardBody.appendChild(des);

  let price = document.createElement("h5");
  price.classList.add("card-title");
  price.innerHTML = " $ " + product.price;
  cardBody.appendChild(price);

  let button = document.createElement("div");
  button.classList.add("my-2");
  let form = createForm(product); // Create form synchronously
  button.appendChild(form);
  cardBody.appendChild(button);

  let card = document.createElement("div");
  let classes = [
    "card",
    "p-1",
    "m-3",
    "col-sm-12",
    "col-md-4",
    "col-lg-4",
    "col-xl-3",
    "col-xxl-2",
  ];
  classes.forEach((cls) => {
    card.classList.add(cls);
  });
  card.id = `card${product.id}`;
  card.appendChild(cardBody);

  return card;
}

function createForm(product) {
  let form = document.createElement("form");
  form.classList.add("ajax-form");
  form.method = "post";

  const cartId = fetch("/api/session/current")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to retrieve cart ID");
      }
      return response.json();
    })
    .then((data) => {
      if (data.user && data.user.cart) {
        return data.user.cart;
      }
      return null;
    })
    .catch((error) => {
      console.error("Error retrieving session information:", error);
    });

  cartId.then((cartId) => {
    if (!cartId) {
      return window.location.assign("/login");
    }
    form.action = `/api/carts/${cartId}/product/${product._id}`;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const url = this.action;
      const method = this.getAttribute("method").toUpperCase();
      const formData = new FormData(this);
      fetch(url, {
        method: method,
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            window.location.replace(location.pathname);
          } else {
            console.error(response.status, response.statusText);
            window.location.assign("/login");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });

  form.innerHTML =
    '<button type="submit" class="btn btn-primary mx-4">Agregar al Carrito</button>';

  return form;
}

socket.on("newProduct", (response) => {
  if (response[0].error) {
    console.error(`Error: ${response[0].error}`);
    return;
  }
  req.logger.debug(`Nuevo Producto: ${JSON.stringify(response[1])}`);
  let card = createCard(response[1]);
  let productsContainer = document.getElementById("productsContainer");
  productsContainer.appendChild(card);
});

socket.on("deleteProduct", (product) => {
  req.logger.debug(`Borrado Producto: ${JSON.stringify(product[1])}`);
  let card = document.getElementById(`card${product[1].id}`);
  card.remove();
});

socket.on("updateProduct", (product) => {
  req.logger.debug(`Actualizado Producto: ${JSON.stringify(product[1])}`);
  let card = document.getElementById(`card${product[1].id}`);
  card.insertAdjacentElement("beforebegin", createCard(product[1]));
  card.remove();
});

socket.on("showProducts", (products) => {
  req.logger.debug("showingProducts");
  products = products.payload;
  let productsContainer = document.getElementById("productsContainer");
  productsContainer.innerHTML = "";
  products.forEach((product) => {
    productsContainer.appendChild(createCard(product));
  });
});
