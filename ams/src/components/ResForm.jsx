import React from 'react'
import styles from './Resform.module.css'

const ResForm = () => {
  return (
    <section className={StyleSheet.section}>
      <h2>Response</h2>
      <div className={styles.formGroup}>
        <label htmlFor="reqUrl">Status Code:</label>
       
      </div>
      <div className={styles.formGroup}>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqHeaders">Headers:</label>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reqBody">Body:</label>
      </div>
    </section>
  )
}

export default ResForm