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
    </section>
  );
};

export default ResForm;
