import React, { useEffect, useState } from "react";
import styles from "./ResForm.module.css";
import Button from "./Button";
import { useLocation } from "react-router-dom";

const isValidJson = (jsonString) => {
  if (!jsonString.trim()) return true; // Allow empty values
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

const ResForm = ({ setResponseData, resetCounter, onSave }) => {
  const location = useLocation();
  const prefillData = location.state?.prefillResponse || {};

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState({ headers: false, body: false });

  // Prefill values on mount
  useEffect(() => {
    if (prefillData) {
      setTitle(prefillData.title || "");
      setStatus(prefillData.status || "");
      setHeaders(JSON.stringify(prefillData.headers || {}, null, 2));
      setBody(JSON.stringify(prefillData.body || {}, null, 2));
    }
  }, [resetCounter]);

  useEffect(() => {
    const headersValid = isValidJson(headers);
    const bodyValid = isValidJson(body);
  
    setErrors({
      headers: !headersValid,
      body: !bodyValid,
    });
  }, [headers, body]);
  

  useEffect(() => {
    if (resetCounter) {
      setTitle("");
      setStatus("");
      setHeaders("");
      setBody("");
      setErrors({ headers: false, body: false });
    }
  }, [resetCounter]);

  return (
    <div className={styles.ResForm}>
      <section className={styles.ResSection}>
        <h2>Response</h2>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            data-testid="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter response title"
          />

          <label htmlFor="status">Status Code</label>
          <input
            id="status"
            type="text"
            data-testid="status-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Enter response status"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="headers">Headers (JSON format)</label>
          <textarea
            id="headers"
            value={headers}
            data-testid="headers-input"
            onChange={(e) => setHeaders(e.target.value)}
            rows={4}
            placeholder='{"Content-Type": "application/json"}'
          />
          {errors.headers && (
            <p className={styles.errorText}>Invalid JSON in headers.</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="body">Body (JSON format)</label>
          <textarea
            id="body"
            value={body}
            data-testid="body-input"
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder='{"key": "value"}'
          />
          {errors.body && (
            <p className={styles.errorText}>Invalid JSON in body.</p>
          )}
        </div>

        <Button onClick={() => {
    if (!errors.headers && !errors.body) {
      const data ={
        title,
        status,
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : {},
      };
      onSave(data);
    }
  }}  >Save Mapping</Button>
      </section>
    </div>
  );
};

export default ResForm;
