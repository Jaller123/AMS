import React, { useEffect, useState } from "react";
import styles from "./ResForm.module.css";

// Helper function to validate JSON
const isValidJson = (jsonString) => {
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

    if (status && headersValid && bodyValid) {
      setResponseData({
        status,
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : {},
      });
      setErrors({ headers: false, body: false });
    } else {
      setErrors({
        headers: !headersValid,
        body: !bodyValid,
      });
    }
  }, [status, headers, body, setResponseData]);

  useEffect(() => {
    // Reset form when resetForm is called
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

      {/* Status Code */}
      <div className={styles.formGroup}>
        <label htmlFor="status">Status Code</label>
        <input
          id="status"
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Enter response status"
          data-testid="status-input"
        />
      </div>

      {/* Headers */}
      <div className={styles.formGroup}>
        <label htmlFor="headers">Headers (JSON format)</label>
        <textarea
          id="headers"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          rows={4}
          placeholder='{"Content-Type": "application/json"}'
          data-testid="headers-input"
        />
        {errors.headers && (
          <p className={styles.errorText}>Invalid JSON in headers.</p>
        )}
      </div>

      {/* Body */}
      <div className={styles.formGroup}>
        <label htmlFor="body">Body (JSON format)</label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder='{"key": "value"}'
          data-testid="body-input"
        />
        {errors.body && <p className={styles.errorText}>Invalid JSON in body.</p>}
      </div>
    </section>
  );
};

export default ResForm;