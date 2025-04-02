import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "3306",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ams", // Se till att denna är definierad!
  });
  console.log("Connected to the database successfully.");
  return connection;
}

const connection = await connectToDatabase();
export default connection;
