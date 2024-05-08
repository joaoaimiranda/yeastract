import dbaccessproperties from "./dbaccessproperties.js";
import { createPool } from "mysql2";

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

const dbaccess = createPool(dbaccessproperties).promise();

export async function query(q) {
    const res = await dbaccess.query(q);
    return res[0];
}

export async function querySingleValue(q) {
    const res = await query(q);
    // if (res.length === 0) throw new Error("Result is empty");
    if (res.length === 0) return null;
    return res[0][Object.keys(res[0])[0]];
}

export async function querySingleRow(q) {
    const res = await query(q);
    // if (res.length === 0) throw new Error("Result is empty");
    if (res.length === 0) return null;
    return res[0];
}
