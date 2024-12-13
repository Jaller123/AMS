import React from "react";
import styles from "./Button.module.css";

const Button = ({ onClick, label }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
