export class UserDTO {
  constructor(user) {
    this.name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.rol = user.rol;
    this.id = user._id;
    this.last_connection = user.last_connection;
    this.cart = user.cart;
  }
}
