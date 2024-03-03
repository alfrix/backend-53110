const socket = io();


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

  let card = document.createElement("div");
  let classes = ["card", "p-1", "m-3", "col-sm-12", "col-md-4", "col-lg-4", "col-xl-3", "col-xxl-2"]
  classes.forEach((cls) => {card.classList.add(cls)})
  card.id  = `card${product.id}`
  card.appendChild(cardBody);

  return card
}

socket.on("newProduct", (response) => {
  if (response[0].error) {
    console.error(`Error: ${response[0].error}`);
    return;
  }
  console.log(`Nuevo Producto: ${JSON.stringify(response[1])}`);
  let card = createCard(response[1]);
  let productsContainer = document.getElementById("productsContainer");
  productsContainer.appendChild(card);
});

socket.on("deleteProduct", (product) => {
    console.log(`Borrado Producto: ${JSON.stringify(product[1])}`);
    let card = document.getElementById(`card${product[1].id}`);
    card.remove();
});

socket.on("updateProduct", (product) => {
    console.log(`Actualizado Producto: ${JSON.stringify(product[1])}`);
    let card = document.getElementById(`card${product[1].id}`);
    card.insertAdjacentElement('beforebegin', createCard(product[1]))
    card.remove()
});

socket.on("showProducts", (products) => {
    let productsContainer = document.getElementById("productsContainer");
    productsContainer.innerHTML = ""
    products.forEach(product => {
        productsContainer.appendChild(createCard(product));
    })
})