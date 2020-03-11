import React from "react";

const postcodes = require("node-postcodes.io");

type Prop = {
  lastUpdate: string;
  cases: Map<string, string>;
};

type State = {
  myArea?: string;
  myCaseNo?: string;
  postcode?: string;
  postcodeInput: string;
  found?: boolean;
};

const CANDIDATE_KEYS = ["primary_care_trust", "admin_district"];
const GOV_UK_DATA_SOURCE =
  "https://www.gov.uk/government/publications/coronavirus-covid-19-number-of-cases-in-england/coronavirus-covid-19-number-of-cases-in-england";
class Main extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop);
    this.state = { postcodeInput: "" };
  }

  async findData() {
    const lookupPost = await postcodes.lookup(this.state.postcode);
    const resultPost = lookupPost?.result;
    const lookupResult = resultPost
      ? lookupPost
      : await postcodes.outcodes(this.state.postcode);
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
        if (vv instanceof Array) {
          vv.forEach(vi => {
            has = has || this.props.cases.has(vi);
            const ci = this.props.cases.get(vi);
            if (ci) {
              count = count + Number(this.props.cases.get(vi));
            }
            v = v + ", " + vi;
          });
        } else {
          has = this.props.cases.has(vv);
          count = Number(this.props.cases.get(vv));
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
          {`Last Updated: ${this.props.lastUpdate} `}
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

export default Main;
