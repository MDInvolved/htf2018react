import React, { Component } from 'react';
import './App.css';
import Axios from 'axios';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      mapTiles: [],
      xMaxIndex: 79,
      yMaxIndex: 44,
      isLoading: false,
      currentPlayerPosition: {},
      pyramidPositions: [],
      hiddenDoorPosition: null,
      theMeaningOfLife: null
    }
  }

  componentDidMount() {
    this.getMap();
  }

  getMapTiles = (mapMatrix) => {
    let mapElements = [];
    let pyramidPositions = [];
    let currentPlayerPosition = {};
    for (let yi = 0; yi <= this.state.yMaxIndex; yi++) {
      for (let xi = 0; xi <= this.state.xMaxIndex; xi++) {
        const tile = mapMatrix.find(t => t.x == xi && t.y == yi);
        const type = this.state.hiddenDoorPosition && yi === this.state.hiddenDoorPosition.y && xi === this.state.hiddenDoorPosition.x ? 4 : tile.type;
        mapElements.push(this.mapType(type));

        if (tile.type == 2)
          currentPlayerPosition = { x: tile.x, y: tile.y };
        else if (tile.type == 3) {
          if (pyramidPositions.indexOf(tile) === -1)
            pyramidPositions.push({ x: tile.x, y: tile.y });
        }
      }
      this.setState({
        currentPlayerPosition: currentPlayerPosition,
        pyramidPositions: pyramidPositions
      });
      mapElements.push(<br />);
    }

    return mapElements;
  }

  movePlayer = (direction) => {
    return () => {
      let newPosition = Object.assign({}, this.state.currentPlayerPosition);

      switch (direction) {
        case 'up':
          newPosition.y = newPosition.y - 5;
          break;
        case 'down':
          newPosition.y = newPosition.y + 5;
          break;
        case 'right':
          newPosition.x = newPosition.x + 5;
          break;
        case 'left':
          newPosition.x = newPosition.x - 5;
          break;
        default:
          break;
      }

      if (this.state.pyramidPositions.some(p => p.x === newPosition.x && p.y === newPosition.y)) {
        alert('No climbing on the pyramids boi!!');
        return;
      }

      this.postMovePlayer(newPosition).then(x => this.getMap());
    }
  }

  mapType = (type) => {
    let icon = '.....';
    switch (type) {
      case 1:
        icon = '.....';
        break;
      case 2:
        icon = ' X ';
        break;
      case 3:
        icon = ' P ';
        break;
      case 4:
        icon = ' D ';
        break;
      default:
        icon = '.....';
    }
    return icon;
  }

  //SERVER CALLS
  getMap = () => {
    this.setState({ isLoading: true });
    return Axios.get('http://involved-htf-js-2018-prod.azurewebsites.net/api/challenge/3',
      {
        headers: {
          'accept': 'application/json',
          'Content-type': 'application/json',
          'x-team': 'test'
        }
      }
    ).then(result => {
      this.setState({
        mapTiles: this.getMapTiles(result.data.tiles),
        isLoading: false
      });
    }).catch(x => {
      this.setState({
        isLoading: false
      });
      alert('Bad Request on Fetch Map');
    });
  }

  postMovePlayer = (newPosition) => {
    this.setState({ isLoading: true });
    return Axios.post('http://involved-htf-js-2018-prod.azurewebsites.net/api/challenge/3/move',
      newPosition,
      {
        headers: {
          'accept': 'application/json',
          'Content-type': 'application/json',
          'x-team': 'test'
        }
      }
    ).then(result => {
      this.setState({
        isLoading: false
      });
    }).catch(x => {
      this.setState({
        isLoading: false
      });
      alert('Bad Request on Fetch Map');
    });
  }

  postPyramidPositions = () => {
    this.setState({ isLoading: true });
    return Axios.post('http://involved-htf-js-2018-prod.azurewebsites.net/api/challenge/3',
      { positions: this.state.pyramidPositions },
      {
        headers: {
          'accept': 'application/json',
          'Content-type': 'application/json',
          'x-team': 'test'
        }
      }
    ).then(result => {
      this.getMap();
      this.setState({
        isLoading: false,
        hiddenDoorPosition: result.data
      });
    }).catch(x => {
      this.setState({
        isLoading: false
      });
      alert('Bad Request on Fetch Map');
    });
  }

  postHiddenDoorPosition = () => {
    this.setState({ isLoading: true });
    return Axios.post('http://involved-htf-js-2018-prod.azurewebsites.net/api/challenge/3/final',
      this.state.hiddenDoorPosition,
      {
        headers: {
          'accept': 'application/json',
          'Content-type': 'application/json',
          'x-team': 'test'
        }
      }
    ).then(result => {
      this.setState({
        isLoading: false,
        theMeaningOfLife: result.data.secret
      });
    }).catch(x => {
      this.setState({
        isLoading: false
      });
      alert('Bad Request on Fetch Map');
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Challenge 3 {!this.state.isLoading || ' - Loading'}
          </p>
          <div id='map' className="App-map">
            {this.state.mapTiles}
          </div>
          <button id='up' onClick={this.movePlayer('up')}>UP</button>
          <button id='down' onClick={this.movePlayer('down')}>DOWN</button>
          <button id='right' onClick={this.movePlayer('right')}>RIGHT</button>
          <button id='left' onClick={this.movePlayer('left')}>LEFT</button>
          <div id="pyramids">Amount of pyramids found: {this.state.pyramidPositions.length}</div>
          {this.state.pyramidPositions.length !== 3 ||
            <div id="allPyramidsFound">
              You found the 3 pyramids! ===>>>  <button id='openDoor' onClick={this.postPyramidPositions}>Find the hidden door</button>
            </div>
          }
          {!this.state.hiddenDoorPosition ||
            <div id="hiddenDoor">
              Hidden Door Found! ===>>>  <button id='openDoor' onClick={this.postHiddenDoorPosition}>OPEN THE DOOR</button>
            </div>
          }
          {!this.state.theMeaningOfLife ||
            <h2 id="meaningOfLife">
              The Meaning of life: {this.state.theMeaningOfLife}
            </h2>
          }
        </header>
      </div >
    );
  }
}

export default App;
