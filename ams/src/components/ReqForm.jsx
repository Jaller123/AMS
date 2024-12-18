// src/components/ReqForm.js
import React, { useEffect } from "react";
import FormField from "./FormField";
import styles from "./ReqForm.module.css";

const ReqForm = ({ setRequestData }) => {
  const [url, setUrl] = React.useState("");
  const [method, setMethod] = React.useState("GET");

  useEffect(() => {
    setRequestData({ url, method });
  }, [url, method, setRequestData]);

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
    </section>
  );
};

export default ReqForm;
