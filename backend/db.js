const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "riri",
  database: "bug_tracker",
  connectionLimit: 5
});

module.exports = pool;
