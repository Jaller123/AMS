import React from "react";
import styles from "./Resform.module.css";

const ResForm = ({ response }) => {
  return (
    <section className={styles.section}>
      <h2>Response</h2>

      <div className={styles.formGroup}>
<<<<<<< HEAD
        <label>Status Code</label>
        <textarea rows="1" readOnly value={response?.status} />
      </div>

      <div className={styles.formGroup}>
        <label>Headers</label>
        <textarea rows="3" readOnly value={JSON.stringify(response?.headers)} />
      </div>

=======
        <label htmlFor="reqUrl">Status Code:</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="1"
          placeholder="200, OK "
          className={styles.textarea}
        ></textarea>
      </div>
      <div className={styles.formGroup}></div>
>>>>>>> 2ba4369f9db74a24e1d741177a8d298391f7f7d8
      <div className={styles.formGroup}>
        <label>Body</label>
        <textarea rows="5" readOnly value={JSON.stringify(response?.body)} />
      </div>
    </section>
  );
};

export default ResForm;
