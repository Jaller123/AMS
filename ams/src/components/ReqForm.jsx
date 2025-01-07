import React, { useEffect, useState } from "react";
import FormField from "./FormField";
import styles from "./ReqForm.module.css";

// Helper function to validate JSON
const isValidJson = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

const ReqForm = ({ setRequestData }) => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState({ headers: false, body: false });

  useEffect(() => {
    const headersValid = isValidJson(headers);
    const bodyValid = isValidJson(body);

    if (headersValid && bodyValid) {
      setRequestData({
        url,
        method,
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : {},
      });
    } else {
      setErrors({
        headers: !headersValid,
        body: !bodyValid,
      });
    }
  }, [url, method, headers, body, setRequestData]);
  const [id, setId] = useState(""); 

  useEffect(() => {
    const requestData = { url, method };
    if (method === "DELETE" && id) {
      requestData.id = id; 
    }
    setRequestData(requestData);
  }, [url, method, id, setRequestData]);

  return (
    <section className={styles.section}>
      <h2>Request</h2>
      <FormField
        label="URL"
        value={url}
        onChange={setUrl}
        placeholder="Enter the request URL"
      />
      <FormField
        label="Method"
        value={method}
        onChange={setMethod}
        type="select"
      />
      <FormField
        label="Headers (JSON format)"
        value={headers}
        onChange={setHeaders}
        type="textarea"
        rows={4}
        placeholder='{"Content-Type": "application/json"}'
      />
      {errors.headers && (
        <p className={styles.errorText}>Invalid JSON in headers.</p>
      )}
      <FormField
        label="Body (JSON format)"
        value={body}
        onChange={setBody}
        type="textarea"
        rows={4}
        placeholder='{"key": "value"}'
      />
      {errors.body && <p className={styles.errorText}>Invalid JSON in body.</p>}
      <div className={styles.formGroup}>
        <label>Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={styles.input}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      {method === "DELETE" && (
        <FormField
          label="ID"
          value={id}
          onChange={setId}
          placeholder="Enter the ID to delete"
        />
      )}
    </section>
  );
};

export default ReqForm;
