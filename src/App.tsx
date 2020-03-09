import React from "react";
import "./App.css";

type State = {
  ready: boolean;
  failed: boolean;
  postcode?: string;
  lastUpdate?: string;
  cases?: Map<string, number>;
};

const DATA_SOURCE = "data_source.json";

class App extends React.Component<{}, State> {
  state = {
    ready: false,
    failed: false
  };

  async fetchData() {
    if (this.state.ready) return;
    const resp = await fetch(DATA_SOURCE);
    if (resp.ok) {
      const data = await resp.json();
      this.setState({ ready: true, ...data });
    } else {
      this.setState({ failed: true });
    }
  }

  componentDidMount() {
    this.fetchData().then(() => console.log("Data Loaded"));
  }

  render() {
    if (this.state.ready) {
      return this.render_main();
    } else if (this.state.failed) {
      return <div>Error</div>;
    }
    return <div>Loading...</div>;
  }

  render_main() {
    return <div></div>;
  }
}

export default App;
