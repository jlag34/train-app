const express = require('express');
const path = require('path');
const request = require('request');
const app = express();
const _ = require('lodash');


const fixRow = row => {
  const split = row.split(',');
  const newData = split.map(ind => {
    const str = ind.replace(/["\r]+/g, '');
    return str;
  });
  return newData;
}

const csvToJson = (csv) => {
  const content = csv.split('\n');
  const header = fixRow(content[0]);
  return _.tail(content).map((row) => {
    const data = fixRow(row);
    return _.zipObject(header, data);
  });
}

app.get('/data', (req, res) => {
  request('http://developer.mbta.com/lib/gtrtfs/Departures.csv', (error, response, body) => {
    res.send(csvToJson(body));
  });
});

if (process.env.NODE_ENV !== 'production') {
  const webpackMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config.js');
  app.use(webpackMiddleware(webpack(webpackConfig)));
} else {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.listen(process.env.PORT || 3050, () => console.log('Listening'));