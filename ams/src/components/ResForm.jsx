import React, { useEffect, useState } from "react";
import FormField from "./FormField";
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

const ResForm = ({ setResponseData }) => {
  const [status, setStatus] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState({ headers: false, body: false });

  useEffect(() => {
    // Validate headers and body
    const headersValid = isValidJson(headers);
    const bodyValid = isValidJson(body);

    // If valid, update the response data
    if (status && headersValid && bodyValid) {
      setResponseData({
        status,
        headers: JSON.parse(headers),
        body: JSON.parse(body),
      });
      setErrors({ headers: false, body: false });
    } else {
      // Set errors for invalid fields
      setErrors({
        headers: !headersValid,
        body: !bodyValid,
      });
    }
  }, [status, headers, body, setResponseData]);

  return (
    <section className={styles.section}>
      <h2>Response</h2>
      <FormField
        label="Status Code"
        value={status}
        onChange={setStatus}
        placeholder="Enter response status"
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
        <label htmlFor="reqUrl">Status Code:</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="1"
          readOnly
          value={response?.status || "No status received"}
          className={styles.textarea}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Headers</label>
        <textarea
          rows="5"
          readOnly
          value={response?.headers ? JSON.stringify(response.headers, null, 2) : "No headers received"}
        ></textarea>
      </div>

      <div className={styles.formGroup}>
        <label>Body</label>
        <textarea rows="5" readOnly  value={response?.body ? JSON.stringify(response.body, null, 2) : "No body received"} />
      </div>
    </section>
  );
};

export default ResForm;
