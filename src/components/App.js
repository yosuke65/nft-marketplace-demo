import React, { Component } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import { Nav } from "react-bootstrap";
import KryptoBird from "../abis/KryptoBird.json";
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImage,
  MDBBtn,
} from "mdb-react-ui-kit";
import "./App.css";

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    const provider = await detectEthereumProvider();

    if (provider) {
      console.log("ethereum wallet is connected");
      window.web3 = new Web3(provider);
    } else {
      console.log("no ethereum wallet detected");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.requestAccounts();
    this.setState({
      account: accounts[0],
    });

    const networkId = await window.ethereum.request({ method: "net_version" });
    const networkData = KryptoBird.networks[networkId];

    if (networkData) {
      const abi = KryptoBird.abi;
      console.log("abi" + abi);
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply });
      console.log("totalSupply" + this.state.totalSupply);

      for (let i = 1; i <= totalSupply; i++) {
        const kryptoBird = await contract.methods.kryptoBirdz(i - 1).call();
        this.setState({ kryptoBirdz: [...this.state.kryptoBirdz, kryptoBird] });
      }
      console.log(this.state.kryptoBirdz);
    } else {
      window.alert("Smart Contract not deployed");
    }
  }

  mint = (kryptoBird) => {
    this.state.contract.methods
      .mint(kryptoBird)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        console.log("On transactionHash - ");
        console.log(hash);
      })
      .on("confirmation", (confirmationNumber, receipt) => {
        console.log("on confirmation - Confirmation Number");
        console.log(confirmationNumber);
        console.log("receipt");
        console.log(receipt);
        this.setState({ kryptoBirdz: [...this.state.kryptoBirdz, kryptoBird] });
      })
      .on("receipt", (receipt) => {
        console.log("on receipt");
        console.log(receipt);
      })
      .on("error", (error, receipt) => {
        console.log("on error");
        console.log("Transaction was rejected by the network with error");
        console.log(error);
        if (receipt) {
          console.log("A receipt was included with rejection as follows:");
          console.log(receipt);
        }
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      contract: null,
      totalSupply: 0,
      kryptoBirdz: [],
    };
  }

  render() {
    return (
      <div className="container-filled">
        {console.log("Inside div")}
        {console.log(this.state.kryptoBirdz)}
        <Nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <div
            className="navbar-brand col-sm-3 col-md-3 mr-0"
            style={{ color: "white" }}
          >
            Krypto Birdz NFTs (Non Fungible Tokens)
          </div>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </Nav>
        <div className="container-fluid mt-1">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div
                className="content mr-auto ml-auto"
                style={{ opacity: "0.8" }}
              >
                <h1 style={{ color: "white" }}>
                  KryptoBirdz - NFT Marketplace
                </h1>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const kryptoBird = this.kryptoBird.value;
                    this.mint(kryptoBird);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Add a file location"
                    className="form-control mb-1"
                    ref={(input) => (this.kryptoBird = input)}
                  />
                  <input
                    type="submit"
                    className="btn btn-primary btn-black"
                    value="MINT"
                    style={{ margin: "6px" }}
                  />
                </form>
              </div>
            </main>
          </div>
          <hr></hr>
          <div className="row textCenter">
            {this.state.kryptoBirdz.map((kryptoBird, key) => (
              <div>
                <div>
                  <MDBCard className="token img" style={{ maxWidth: "22rem" }}>
                    <MDBCardImage
                      src={kryptoBird}
                      position="top"
                      height="250rem"
                      style={{ marginRight: "4px" }}
                    />
                    <MDBCardBody>
                      <MDBCardTitle>KryptoBirdz</MDBCardTitle>
                      <MDBCardText>
                        The KryptoBirdz are 20 uniquely generated KBirdz from
                        the cyberpunk cloud galaxy Mystopia! There is only one
                        of each bird and each bird can be owned by a single
                        person on the Ethereum blockchain.
                      </MDBCardText>
                      <MDBBtn href={kryptoBird}>Download</MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
