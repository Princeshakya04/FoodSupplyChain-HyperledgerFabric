import React, { Component } from "react";
import { Link } from "react-router-dom";

export class Navbar extends Component {
  render() {
    const role = sessionStorage.getItem("role");
    console.log(role);
    return (
      <div>
      <br></br>
        <h2>Food Supply Chain</h2>
        <br></br>
      <nav className="navbar navbar-light bg-light navbar-expand-lg">
        <div className="navbar-brand"></div>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="navbar-item navbar-brand navbar">
              <Link to="/createUser" className="nav-link">
                CREATE USER
              </Link>
            </li>
            <li className="navbar-item navbar-brand navbar">
              <Link to="/createProduct" className="nav-link">
                CREATE PRODUCT
              </Link>
            </li>
            <li className="navbar-item navbar-brand navbar">
              <Link to="/users" className="nav-link">
                USERS
              </Link>
            </li>
            <li className="navbar-item navbar-brand navbar">
              <Link to="/products" className="nav-link">
                PRODUCTS
              </Link>
            </li>
            {/* <li className="navbar-item">
              <Link to="/createOrder" className="nav-link">
                Create Order
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/orders" className="nav-link">
                Orders
              </Link>
            </li> */}
            <li className="navbar-item navbar-brand   navbar">
              <Link to="/" className="nav-link">
                LOGOUT
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      </div>
    );
  }
}

export default Navbar;
