import react from "react";
import styles from "./ReqForm.module.css";

const ReqForm = () => {
  return (
    <section className={StyleSheet.section}>
      <h2>Request</h2>
      <div className={styles.formGroup}>
        <label htmlFor="reqUrl">URL</label>
        <input
          type="text"
          id="reqUrl"
          name="reqUrl"
          placeholder="Enter the request URL"
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqMethod">Method</label>
        <select id="reqMethod" name="reqMethod" className={styles.input}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqHeaders">Headers (JSON format)</label>

        <textarea
          id="reqHeaders"
          name="reqHeaders"
          rows="4"
          placeholder='{"Content-Type": "application/json"}'
          className={styles.textarea}
        ></textarea>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqBody">Body (JSON format)</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="4"
          placeholder='{"key": "value"}'
          className={styles.textarea}
        ></textarea>
      </div>
    </section>
  );
};
export default ReqForm;
