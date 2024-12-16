import React from "react";
import styles from "./MappingsPage.module.css";

const MappingsPage = ({ mappings }) => {
  return (
    <section className={styles.section}>
      <h2>Saved Mappings</h2>
      {mappings.length === 0 ? (
        <p>No mappings saved yet.</p>
      ) : (
        <ul className={styles.mappingList}>
          {mappings.map((mapping, index) => (
            <li key={index} className={styles.mappingItem}>
              <pre>{JSON.stringify(mapping, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MappingsPage;
