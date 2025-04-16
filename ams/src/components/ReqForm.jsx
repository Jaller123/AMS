import React, { useState, useEffect } from "react";
import styles from "./ReqForm.module.css";
import { useLocation } from "react-router-dom";

const isValidJson = (jsonString) => {
  if (typeof jsonString !== "string") return false;
  if (!jsonString.trim()) return false;
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

const urlMatchExamples = {
  Url: "Example: /url",
  urlEqualTo: "Example: /your/exact/url?with=query",
  urlPattern: "Example: /your/([a-z]*)\\?with=query",
  urlPath: "Example: /your/exact/url",
  urlPathPattern: "Example: /your([a-z]*)",
  urlPathTemplate: "Example: /contacts{contactId}/addresses/{addressId}",
};

const ReqForm = ({ setRequestData, resetForm }) => {
  const location = useLocation();
  // Kolla om det finns redan ifylld data genom state
  const prefillMapping = location.state?.prefillRequest || {};

  const initialHeaders =
    typeof prefillMapping.headers === "string"
      ? prefillMapping.headers
      : JSON.stringify(
          prefillMapping.headers || { "Content-Type": "application/json" }
        );
  const initialBody =
    typeof prefillMapping.body === "string"
      ? prefillMapping.body
      : JSON.stringify(prefillMapping.body);

  const [url, setUrl] = useState(prefillMapping.url || "");
  const [urlMatchType, setUrlMatchType] = useState(
    prefillMapping.urlMatchType || "Url"
  );
  const [method, setMethod] = useState(prefillMapping.method || "GET");
  const [headers, setHeaders] = useState(initialHeaders);
  const [body, setBody] = useState(initialBody);
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
        urlMatchType,
      });
    }
  }, [title, url, method, headers, body, urlMatchType, setRequestData]);

  useEffect(() => {
    if (resetForm) {
      setUrl("");
      setMethod("GET");
      setHeaders("{}");
      setBody("{}");
      setTitle("");
      setUrlMatchType("urlEqualTo");
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

          <small className={styles.exampleText}>
            {urlMatchExamples[urlMatchType]}
            <label htmlFor="urlMatchType">URL Matching Option</label>
            <select
              id="urlMatchType"
              value={urlMatchType}
              onChange={(e) => setUrlMatchType(e.target.value)}
            >
              <option value="Url">Url</option>
              <option value="urlEqualTo">urlEqualTo</option>
              <option value="urlPattern">urlPattern</option>
              <option value="urlPath">urlPath</option>
              <option value="urlPathPattern">urlPathPattern</option>
              <option value="urlPathTemplate">urlPathTemplate</option>
            </select>
          </small>
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
            placeholder='{"key": "value" }'
          />
        </div>
      </section>
    </div>
  );
};

export default ReqForm;
