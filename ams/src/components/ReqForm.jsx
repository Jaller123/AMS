import React, { useState, useEffect } from "react";
import styles from "./ReqForm.module.css";

const isValidJson = (jsonString) => {
  if (!jsonString.trim()) return true;
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
  const [errors, setErrors] = useState({ headers: false, body: false });

  useEffect(() => {
    const headersValid = isValidJson(headers);
    const bodyValid = isValidJson(body);

    setErrors({
      headers: !headersValid,
      body: !bodyValid,
    });

    if (headersValid && bodyValid) {
      setRequestData({
        title: title || "",
        url: url || "",
        method: method || "GET",
        headers: headers ? JSON.parse(headers) : {},
        body: body ? JSON.parse(body) : {},
      });
    }
  }, [title, url, method, headers, body, setRequestData]);

  useEffect(() => {
    if (resetForm) {
      setUrl("");
      setMethod("GET");
      setHeaders("");
      setBody("");
      setTitle("");
      setErrors({ headers: false, body: false });
    }
  }, [resetForm]);

  return (
    
      <div className={styles.ReqForm}>
        <section className={styles.section}>
          <h2>Request</h2>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              data-testid="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter request title"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="url">URL</label>
            <input
              id="url"
              type="text"
              value={url}
               data-testid="url-input"
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter the request URL"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="method">Method</label>
            <select
              id="method"
               data-testid="method-select"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="headers">Headers (JSON format)</label>
            <textarea
              id="headers"
              value={headers}
              data-testid="headers-input-req"
              onChange={(e) => setHeaders(e.target.value)}
              rows={4}
              placeholder='{"Content-Type": "application/json"}'
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="body">Body (JSON format)</label>
            <textarea
              id="body"
              value={body}
              data-testid="body-input-req"
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder='{"key": "value"}'
            />
          </div>
        </section>
      </div>
    );
    
  
};

export default ReqForm;
