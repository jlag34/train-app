import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = { north: [], south: [] };

    this.fetchData = this.fetchData.bind(this);
    this.formatRequest = this.formatRequest.bind(this);
  }

  componentDidMount() {
    // Make call for data
    this.fetchData();
  }

  formatRequest(data) {
    // Setup new object to display correct values
    const result = {};
    result.carrier = 'MBTA';
    result.time = data.ScheduledTime;
    result.destination = data.Destination;
    result.train = data.Trip;
    result.track = data.Track.length ? data.Track : 'TBD';
    result.status = data.Status;
    result.origin = data.Origin;

    return result;
  }

  fetchData() {
    // Get the data
    const that = this;
    const data = [];
    const decoder = new TextDecoder();
    fetch('/data')
      .then(response => {
        // Data comes back as a ReadableStream, handle it
        var reader = response.body.getReader();

        // Read() returns a promise that resolves
        // when a value has been received
        reader.read()
      .then(function processResult(result) {
        if (result.value) {
          data.push(decoder.decode(result.value));
        }

        if (result.done) {
          let result = JSON.parse(data);
          const north = [];
          const south = [];

          result.forEach(arr => {
            if (arr.TimeStamp.length === 0) {
              return;
            }
            const formatted = that.formatRequest(arr);
            if (formatted.origin === 'North Station') {
              delete formatted.origin;
              north.push(formatted);
            } else if (formatted.origin === 'South Station') {
              delete formatted.origin;
              south.push(formatted);
            }
          });
          that.setState({north, south})
          return;
        }

        // Read some more, and recall this function
        return reader.read().then(processResult);
      });
    });
  }

  render() {
    return (
      <div>
        {Object.keys(this.state).map(station => {
          const stationName = station === 'north' ? 'NORTH' : 'SOUTH';
          if (this.state[station].length > 0) {
            return (
              <Table key={station}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="table-header-container" colSpan="6">
                      <div className="table-header">
                        <div>
                          <div>
                            {moment().format('dddd')}
                          </div>
                          <div>
                            {moment().format('MM-DD-YYYY')}
                          </div>
                        </div>
                        <div>
                          <div>
                            {`${stationName} STATION INFORMATION`}
                          </div>
                          <div>
                          </div>
                        </div>
                        <div>
                          <div>
                            CURRENT TIME
                          </div>
                          <div className="float-right">
                            {moment().format('h:mm A')}
                          </div>
                        </div>
                      </div>
                    </Table.HeaderCell>
                  </Table.Row>
                  <Table.Row>
                    {Object.keys(this.state[station][0]).map((header, key) => {
                      return <Table.HeaderCell key={key}>{header.toUpperCase()}</Table.HeaderCell>
                    })}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.state[station].map((arr, keyTwo) => {
                    if (arr.TimeStamp === '') {
                      return;
                    }
                    return (
                      <Table.Row key={keyTwo}>
                        {Object.keys(arr).map((data, keyThree) => {
                          let result = arr[data];
                          if (data === 'time') {
                            result = moment.unix(arr[data]).format('h:mm A');
                          }
                          return <Table.Cell key={keyThree}>{result}</Table.Cell>
                        })}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            );
          }
        })}
      </div>
    );
  }
}

export default Home;