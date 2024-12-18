// src/components/FormField.js
import React from "react";
import styles from "./FormField.module.css";

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rows = 1,
}) => (
  <div className={styles.formGroup}>
    <label>{label}</label>
    {type === "textarea" ? (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.textarea}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default FormField;
