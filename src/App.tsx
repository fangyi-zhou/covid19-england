import React from "react";
import "./App.css";

const postcodes = require("node-postcodes.io");

type State = {
  ready: boolean;
  failed: boolean;
  postcode?: string;
  lastUpdate?: string;
  cases: Map<string, string>;
  myArea?: string;
  myCaseNo?: string;
  postcodeInput: string;
  found?: boolean;
};

const CANDIDATE_KEYS = ["primary_care_trust", "admin_district"];
const DATA_SOURCE = process.env.PUBLIC_URL + "/data_source.json";
const GOV_UK_DATA_SOURCE =
  "https://www.gov.uk/government/publications/coronavirus-covid-19-number-of-cases-in-england/coronavirus-covid-19-number-of-cases-in-england";

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      ready: false,
      failed: false,
      cases: new Map(),
      postcodeInput: ""
    };
  }

  async fetchDataSource() {
    if (this.state.ready) return;
    const resp = await fetch(DATA_SOURCE);
    if (resp.ok) {
      const { cases, last_update } = await resp.json();
      let cases_map = new Map();
      for (const area in cases) {
        cases_map.set(area, cases[area]);
      }
      this.setState({ ready: true, lastUpdate: last_update, cases: cases_map });
    } else {
      this.setState({ failed: true });
    }
  }

  componentDidMount() {
    this.fetchDataSource().then(() => console.log("Data Loaded"));
  }

  async findData() {
    const lookupPost = await postcodes.lookup(this.state.postcode);
    const resultPost = lookupPost?.result;
    const lookupResult = (resultPost)?
      lookupPost : await postcodes.outcodes(this.state.postcode);
    const result = lookupResult?.result;
    if (!result) {
      this.setState({ found: false });
      return;
    }
    for (let k of CANDIDATE_KEYS) {
      if (k in result) {
        const vv = result[k];
        let count = 0;
        let has = false;
        let v = "";
        if (vv instanceof Array){
          vv.forEach((vi) => {
            has = has || this.state.cases.has(vi);
            const ci = this.state.cases.get(vi);
            if (ci) {
              count = count + Number(this.state.cases.get(vi));
            }
            v = v + ", " + vi;
          });
        } else {
          has = this.state.cases.has(vv);
          count = Number(this.state.cases.get(vv));
          v = vv;
        }
        if (has) {
          const numCases = String(count);
          this.setState({ myArea: v, myCaseNo: numCases, found: true });
        }
      }
    }
  }

  render() {
    if (this.state.ready) {
      if (this.state.postcode) {
        if (this.state.found === undefined) {
          this.findData().then(() => console.log("Data Found"));
        } else if (this.state.found === false) {
          return (
            <div>
              <div>{`Failed to find information about postcode ${this.state.postcode}`}</div>
              <form onSubmit={this.handleReset.bind(this)}>
                <input type="submit" value="Reset" />
              </form>
            </div>
          );
        }
      }
      return this.render_main();
    } else if (this.state.failed) {
      return <div>Error loading data</div>;
    }
    return <div>Loading...</div>;
  }

  handlePostcode(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ postcodeInput: event.target.value });
  }

  handleSubmit() {
    this.setState({ postcode: this.state.postcodeInput });
  }

  handleReset() {
    this.setState({ postcode: undefined, found: undefined });
  }

  render_main() {
    return this.state.postcode && this.state.myArea && this.state.myCaseNo ? (
      <div>
        <div>{`You're at ${this.state.myArea}. There are ${this.state.myCaseNo} COVID-19 case(s) in your area.`}</div>
        <form onSubmit={this.handleReset.bind(this)}>
          <input type="submit" value="Reset" />
        </form>
        <div>
          {`Last Updated: ${this.state.lastUpdate} `}
          <a href={GOV_UK_DATA_SOURCE}>Source</a>
        </div>
      </div>
    ) : this.state.postcode ? (
      <div>Loading...</div>
    ) : (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input
          type="text"
          value={this.state.postcodeInput}
          onChange={this.handlePostcode.bind(this)}
        />
        <input type="submit" value="Find" />
      </form>
    );
  }
}

export default App;
