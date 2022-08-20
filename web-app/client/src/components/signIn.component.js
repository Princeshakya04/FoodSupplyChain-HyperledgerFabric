import React, { Component } from "react";
import axios from "axios";

export class SignIn extends Component {
  constructor(props) {
    super(props);

    this.onChangeUserType = this.onChangeUserType.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.submitForm = this.submitForm.bind(this);

    this.state = {
      userType: "manufacturer",
      name: "",
      password: "",
      role: "manufacturer",
    };
  }

  onChangeUserType(e) {
    console.log(e.target.value)
    if (e.target.value === "admin") {
      this.setState({
        role: "admin",
      });
    } else if (e.target.value === "manufacturer") {
      this.setState({
        role: "manufacturer",
      });
    } else if (e.target.value === "consumer") {
      this.setState({
        role: "consumer",
      });
    } else if (
      e.target.value === "wholesaler" ||
      e.target.value === "distributor" ||
      e.target.value === "retailer"
    ) {
      this.setState({
        role: "middlemen",
      });
    }
    this.setState({
      userType: e.target.value,
    });
  }

  onChangeName(e) {
    this.setState({
      name: e.target.value,
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value,
    });
  }

  submitForm(e) {
    e.preventDefault();

    const signIn = {
      id: this.state.name,
      password: this.state.password,
    };

    console.log(signIn);

    axios
      .post("http://127.0.0.1:8090/user/signin/" + this.state.role, signIn)
      .then((res) => {
        console.log(res.data.data.accessToken);
        sessionStorage.setItem("jwtToken", res.data.data.accessToken);
        sessionStorage.setItem("role", this.state.role);
        sessionStorage.setItem("usertype", this.state.userType);
        window.location = "/users"
      });

    if (this.state.usertype === "admin") {
      // window.location = "/users"
    }
    else {
      // window.location = "/products"
    }
  }

  render() {
    return (
      <div>
        <h3>Sign In</h3>
        <br />
        <form>
          <div className="form-group">
            <label>Usertype: </label>
            <select
              ref="usertypeInput"
              required
              className="form-control"
              value={this.state.userType}
              onChange={this.onChangeUserType}
            >
              <option key="manufacturer" value="manufacturer">
                Manufacturer
              </option>
              <option key="distributor" value="distributor">
                Distributor
              </option>
              <option key="wholesaler" value="wholesaler">
                Wholesaler
              </option>
              <option key="retailer" value="retailer">
                Retailer
              </option>
              <option key="consumer" value="consumer">
                Consumer
              </option>
            </select>
          </div>
          <div className="form-group">
            <label>Name: </label>
            <input
              type="text"
              required
              className="form-control"
              value={this.state.name}
              onChange={this.onChangeName}
            />
          </div>
          <div className="form-group">
            <label>Password: </label>
            <input
              type="password"
              required
              className="form-control"
              value={this.state.password}
              onChange={this.onChangePassword}
            />
          </div>
          <div className="form-group">
            <input type="button" onClick={this.submitForm} value="Sign In" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}

export default SignIn;
