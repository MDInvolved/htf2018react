import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Axios from "axios";

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      passcode: '-----'
    }
  }

  onClickDigitButton = (value) => {
    return () => {
      let passcode = this.state.passcode.split('');
      const indexToReplace = passcode.indexOf('-');

      if (indexToReplace >= 0)
        passcode[indexToReplace] = value;

      this.setState({
        passcode: passcode.join('')
      });
    };
  }

  onClickReset = () => {
    this.setState({
      passcode: '-----'
    });
  }

  onClickEnter = () => {
    Axios.post('http://involved-htf-js-2018-prod.azurewebsites.net/api/challenge/1',
      {
        sequence: this.state.passcode.split('').join(',')
      },
      {
        headers: {
          'accept': 'application/json',
          'Content-type': 'application/json',
          'x-team': 'test'
        }
      }
    ).then(result => {
      alert('Great Success!');
    }).catch(x => {
      alert('No Access');
    });
  }

  render() {
    const digits = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['0']];

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Enter the code
          </p>

          <p>
            {this.state.passcode}
          </p>

          {digits.map(subArray => {
            return <div>{subArray.map(x => {
              return <button
                type="button"
                onClick={this.onClickDigitButton(x)}>
                {x}
              </button>;
            })
            }</div>
          })}

          <button
            type="button"
            onClick={this.onClickEnter}>
            Click to Enter
          </button>

          <button
            type="button"
            onClick={this.onClickReset}>
            reset
          </button>
        </header>
      </div>
    );
  }
}

export default App;
