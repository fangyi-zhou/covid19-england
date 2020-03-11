import React from "react";
import "./App.css";
import Main from "./Main";

type State = {
  loaded: boolean;
  failed: boolean;
  lastUpdate: string;
  cases: Map<string, string>;
};

const DATA_SOURCE = process.env.PUBLIC_URL + "/data_source.json";

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      loaded: false,
      failed: false,
      cases: new Map(),
      lastUpdate: ""
    };
  }

  async fetchDataSource() {
    if (this.state.loaded) return;
    const resp = await fetch(DATA_SOURCE);
    if (resp.ok) {
      const { cases, last_update } = await resp.json();
      let cases_map = new Map();
      for (const area in cases) {
        cases_map.set(area, cases[area]);
      }
      this.setState({
        loaded: true,
        lastUpdate: last_update,
        cases: cases_map
      });
    } else {
      this.setState({ failed: true });
    }
  }

  componentDidMount() {
    this.fetchDataSource().then(() => console.log("Data Loaded"));
  }

  render() {
    if (this.state.loaded) {
      return (
        <Main lastUpdate={this.state.lastUpdate} cases={this.state.cases} />
      );
    } else if (this.state.failed) {
      return <div>Error loading data</div>;
    }
    return <div>Loading...</div>;
  }
}

export default App;
