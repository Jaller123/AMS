import React from "react";
import styles from "./ResForm.module.css";

const ResForm = ({ response }) => {
  return (
    <section className={styles.section}>
      <h2>Response</h2>

      <div className={styles.formGroup}>
        <label>Status Code</label>
        <textarea rows="1" readOnly value={response?.status} />
      </div>

      <div className={styles.formGroup}>
        <label>Headers</label>
        <textarea rows="3" readOnly value={JSON.stringify(response?.headers)} />
      </div>

      <div className={styles.formGroup}>
        <label>Body</label>
        <textarea rows="5" readOnly value={JSON.stringify(response?.body)} />
      </div>
    </section>
  );
};

export default ResForm;
