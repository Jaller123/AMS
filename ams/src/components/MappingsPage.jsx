import React from "react";
import styles from "./MappingsPage.module.css";

const MappingsPage = ({ mappings, handleDelete }) => {
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
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(mapping.request.url)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MappingsPage;
