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

console.log("Connected to the database successfully.");
export default connection;
