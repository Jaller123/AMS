import React, { useEffect, useState } from "react";
import styles from "./ResForm.module.css";

const isValidJson = (jsonString) => {
  if (!jsonString.trim()) return true; // Allow empty values
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

const ResForm = ({ setResponseData, resetForm }) => {
  const [status, setStatus] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState({ headers: false, body: false });

  useEffect(() => {
    const headersValid = isValidJson(headers);
    const bodyValid = isValidJson(body);

    setErrors({
      headers: !headersValid,
      body: !bodyValid,
    });

    if (headersValid && bodyValid) {
      setResponseData({
        status,
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : {},
      });
    }
  }, [status, headers, body, setResponseData]);

  useEffect(() => {
    if (resetForm) {
      setStatus("");
      setHeaders("");
      setBody("");
      setErrors({ headers: false, body: false });
    }
  }, [resetForm]);

  return (
    <section className={styles.section}>
      <h2>Response</h2>
      <div className={styles.formGroup}>
        <label htmlFor="status">Status Code</label>
        <input
          id="status"
          type="text"
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
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder='{"key": "value"}'
        />
        {errors.body && (
          <p className={styles.errorText}>Invalid JSON in body.</p>
        )}
      </div>
    </section>
  );
};

export default ResForm;
