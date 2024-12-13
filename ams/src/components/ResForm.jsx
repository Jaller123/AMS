import React from "react";
import styles from "./ResForm.module.css";

const ResForm = ({ response }) => {
  return (
    <section className={styles.section}>
      <h2>Response</h2>

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

      <div className={styles.formGroup}></div>

      <div className={styles.formGroup}>
        <label>Body</label>
        <textarea rows="5" readOnly value={JSON.stringify(response?.body)} />
      </div>
    </section>
  );
};

export default ResForm;
