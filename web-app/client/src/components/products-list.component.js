import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Product = (props) => (
  <tr>
    <td>{props.product.ProductID}</td>
    <td>{props.product.Name}</td>
    <td>{props.product.ManufacturerID}</td>
    <td>{props.product.Date.ManufactureDate.substring(0, 10)}</td>
    <td>{props.product.Status}</td>
    <td>{props.product.Price}</td>
    <td>
      <Link to={"/updateProduct/" + props.product.ProductID}>Edit</Link>
    </td>
  </tr>
);

export class ProductsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      role: sessionStorage.getItem('role'),
      products: [],
    };
  }

  componentDidMount() {
    const headers = {
      "x-access-token": sessionStorage.getItem("jwtToken"),
    };

    axios
      .get("http://127.0.0.1:8090/product/" + this.state.role, {
        headers: headers,
      })
      .then((response) => {
        this.setState({
          products: response.data.data,
        });
      })
      .catch((error) => console.log(error));
  }

  productsList() {
    return this.state.products.map((currentProduct) => {
      return (
        <Product
          product={currentProduct.Record}
          deleteProduct={this.deleteProduct}
          key={currentProduct.Key}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <h3>Products List</h3>
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th>ProductId</th>
              <th>ProductName</th>
              <th>ManufacturerId</th>
              <th>ManufacturerDate</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{this.productsList()}</tbody>
        </table>
      </div>
    );
  }
}

export default ProductsList;
