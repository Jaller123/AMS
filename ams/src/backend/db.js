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



console.log("Connected to the database successfully.");
export default connection;
