import React from "react";
import styles from "./Button.module.css";

<<<<<<< HEAD
const Button = ({ onClick, label }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {label}
=======
const Button = ({ url, method, headers, body, onRequestChange }) => {
  
  const handleSubmit = () => {
    if (!url || !method || !headers || !body) {
      alert("All fields are required.");
      return;
    }

    try {
      const parsedHeaders = JSON.parse(headers);
      const parsedBody = JSON.parse(body);

      const requestData = {
        method,
        url,
        headers: parsedHeaders,
        body: parsedBody,
      };

      console.log("Request Data:", requestData);
      onRequestChange(requestData);
    } catch (error) {
      alert("Invalid JSON format in Headers or Body.");
      console.error("Parsing Error:", error);
    }
  };

  return (
    <button onClick={handleSubmit} className={styles.button}>
      Send Mapping
>>>>>>> dc0ffac1e3568fe01476a176b506dc6610059f8e
    </button>
  );
};

export default Button;
