const mongoose = require('mongoose');
const dotenv = require('dotenv');

// process.on('uncaughtException', err => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

dotenv.config({ path: './config.env' });
const app = require('./app');

const dev = process.env.NODE_ENV;

const DB = dev === 'development' 
  ? process.env.DEV_DATABASE.replace('<PASSWORD>', process.env.DEV_DATABASE_PASSWORD)
  : process.env.PROD_DATABASE.replace('<PASSWORD>', process.env.PROD_DATABASE_PASSWORD);

// Example of logging the environment (optional)
console.log(`Connecting to ${dev === 'development' ? 'development' : 'production'} database.`);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful... :) !!!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}... :) !!!`);
});

// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });