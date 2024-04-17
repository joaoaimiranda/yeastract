const dbaccessproperties = require("./dbaccessproperties");
const mysql = require("mysql2");

// function dbaccess(query) {
//     const connection = mysql.createConnection(dbaccessproperties);

//     connection.connect((err) => {
//         if (err) throw err;
//     });

//     connection.query(query, (err, result) => {
//         if (err) throw err;

//         console.log("The solution is: ", result);
//     });

//     connection.end();

//     return ret;
// }

const dbaccess = mysql.createPool(dbaccessproperties).promise();

module.exports = dbaccess;
