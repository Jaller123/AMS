import React, { useState, useEffect } from "react";
import styles from "./ReqForm.module.css";

const isValidJson = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

const ReqForm = ({ setRequestData, resetForm }) => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({ headers: false, body: false, title: false });

  useEffect(() => {
    const headersValid = isValidJson(headers);
    const bodyValid = isValidJson(body);
    const titleValid = title.length > 0;

    setErrors({
      headers: !headersValid,
      body: !bodyValid,
      title: !titleValid,
    });

    if (headersValid && bodyValid && titleValid) {
      setRequestData({
        title,
        url,
        method,
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : {},
      });
    }
  }, [title, url, method, headers, body, setRequestData]);

  useEffect(() => {
    // Om 'resetForm' är true, återställs alla formulärfält till sina standardvärden.
    if (resetForm) {
      setUrl("");
      setMethod("GET");
      setHeaders("");
      setBody("");
      setTitle("");
      setErrors({ headers: false, body: false, title: false });
    }
  }, [resetForm]);

  return (
    <section className={styles.section}>
      <h2>Request</h2>
      {/* Title */}
      <div className={styles.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter request title"
          data-testid="title-input"
        />
        {errors.title && <p className={styles.errorText}>Title is required.</p>}
      </div>

      {/* URL */}
      <div className={styles.formGroup}>
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter the request URL"
          data-testid="url-input"
        />
      </div>

      {/* Method */}
      <div className={styles.formGroup}>
        <label htmlFor="method">Method</label>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          data-testid="method-select"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
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
          data-testid="headers-input-req"
        />
        {errors.headers && <p className={styles.errorText}>Invalid JSON in headers.</p>}
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
          data-testid="body-input-req"
        />
        {errors.body && <p className={styles.errorText}>Invalid JSON in body.</p>}
      </div>
    </section>
  );
};

export default ReqForm;