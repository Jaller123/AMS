import React, { useEffect, useState } from "react";
import FormField from "./FormField";
import styles from "./ReqForm.module.css";

const ReqForm = ({ setRequestData }) => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
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
