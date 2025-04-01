<<<<<<< HEAD
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("DB_USER:", process.env.DB_USER);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD === "" ? "(empty)" : process.env.DB_PASSWORD
);

const connection = await mysql.createConnection({
  host: "localhost", // "localhost"
  port: "3306", // "3306"
  user: "root", // "root"
  password: "", // (empty string if no password)
  database: "ams", // "ams"
});
// db.js
export async function createScenario(scenarioData) {
  // Din logik för att skapa ett scenario
  // Exempel:
  const response = await fetch(`${API_BASE_URL}/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenarioData),
  });

  const data = await response.json();
  return data; // Returnera den skapade scenarion
}
=======
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD === '' ? '(empty)' : process.env.DB_PASSWORD);


const connection = await mysql.createConnection({
  host: process.env.DB_HOST,       // "localhost"
  port: process.env.DB_PORT,       // "3306"
  user: process.env.DB_USER,       // "root"
  password: process.env.DB_PASSWORD, // (empty string if no password)
  database: process.env.DB_NAME,   // "ams"
});


>>>>>>> fe0ebfebe8c420cb662f8eef43024379f577469d

console.log("Connected to the database successfully.");
export default connection;
