import React from 'react'
import styles from './Resform.module.css'

const ResForm = () => {
  return (
    <section className={StyleSheet.section}>
      <h2>Response</h2>
      <div className={styles.formGroup}>
        <label htmlFor="reqUrl">Status Code:</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="1"
          placeholder='200, OK '
          className={styles.textarea}
        ></textarea>
      </div>
      <div className={styles.formGroup}>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqHeaders">Headers:</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="1"
          placeholder='{"Content-Type": "application/json"}'
          className={styles.textarea}
        ></textarea>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqBody">Body:</label>
        <textarea
          id="reqBody"
          name="reqBody"
          rows="6"
          placeholder='"message": "Request successful",
        '
          className={styles.textarea}
        ></textarea>
      </div>
    </section>
  )
}

export default ResForm