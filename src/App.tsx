import React from "react";
import "./App.css";
import { geolocated, GeolocatedProps } from "react-geolocated";

const postcodes = require("node-postcodes.io");

type State = {
  ready: boolean;
  failed: boolean;
  postcode?: string;
  lastUpdate?: string;
  cases: Map<string, string>;
  myArea?: string;
  myCaseNo?: string;
};

const CANDIDATE_KEYS = ["primary_care_trust", "admin_district"];
const DATA_SOURCE = "data_source.json";

class App extends React.Component<GeolocatedProps, State> {
  constructor(props: GeolocatedProps) {
    super(props);
    this.state = {
      ready: false,
      failed: false,
      cases: new Map()
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

  render() {
    if (this.state.ready) {
      if (this.props.coords) {
        this.findCasesByLatLong().then(() =>
          console.log("Loaded Case Numbers")
        );
      }
      return this.render_main();
    } else if (this.state.failed) {
      return <div>Error</div>;
    }
    return <div>Loading...</div>;
  }

  async findCasesByLatLong() {
    const lat = this.props.coords?.latitude;
    const long = this.props.coords?.longitude;
    const postcodeResults = await postcodes.geo(lat, long);
    for (let result in postcodeResults.result) {
      for (let k in CANDIDATE_KEYS) {
        const v = result[k];
        if (v in this.state.cases) {
          const numCases = this.state.cases.get(v);
          this.setState({ myArea: v, myCaseNo: numCases });
        }
      }
    }
  }

  render_main() {
    return !this.props.isGeolocationAvailable ? (
      <div>Your browser does not support Geolocation</div>
    ) : !this.props.isGeolocationEnabled ? (
      <div>Geolocation is not enabled</div>
    ) : this.props.coords && this.state.myArea && this.state.myCaseNo ? (
      <div>{`You're at ${this.state.myArea}. There are ${this.state.myCaseNo} in your area.`}</div>
    ) : (
      <div>Getting the location data&hellip; </div>
    );
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false
  },
  userDecisionTimeout: 5000
})(App);
