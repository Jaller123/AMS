import React, { useState } from "react";
import styles from "./ReqForm.module.css";
import Button from "./Button";

const ReqForm = ({ onRequestChange }) => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");

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
    <section className={styles.section}>
      <h2>Request</h2>
      <div className={styles.formGroup}>
        <label htmlFor="reqUrl">URL</label>
        <input
          id="reqUrl"
          name="reqUrl"
          type="text"
          placeholder="Enter the request URL"
          onChange={(e) => setUrl(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reqMethod">Method</label>
        <select
          id="reqMethod"
          name="reqMethod"
          onChange={(e) => setMethod(e.target.value)}
          className={styles.input}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reqHeaders">Headers (JSON format)</label>
        <textarea
          id="reqHeaders"
          name="reqHeaders"
          rows="4"
          placeholder='{"Content-Type": "application/json"}'
          onChange={(e) => setHeaders(e.target.value)}
          className={styles.textarea}
        ></textarea>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="reqBody">Body (JSON format)</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="4"
          placeholder='{"key": "value"}'
          onChange={(e) => setBody(e.target.value)}
          className={styles.textarea}
        ></textarea>
      </div>

    
      <Button
        url={url}
        method={method}
        headers={headers}
        body={body}
        onRequestChange={onRequestChange}
      />
    </section>
  );
};

export default ReqForm;
