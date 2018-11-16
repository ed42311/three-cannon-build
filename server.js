const express = require('express')
const path = require('path')

// initialize option constants
const PORT = process.env.PORT || 5000;
const MONGODB_OPTS = { useCreateIndex: true, useNewUrlParser: true }
// const config = require('./config')

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.static(path.resolve(__dirname, '../dist')));
app.listen(PORT,  () => {
  console.error(`listening on port ${PORT}`);
});
