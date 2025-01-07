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
              <h3>Request</h3>
              <pre>{JSON.stringify(mapping.request, null, 2)}</pre>
              <h3>Response</h3>
              <pre>{JSON.stringify(mapping.response, null, 2)}</pre>
              <p>
                <strong>Timestamp:</strong>{" "}
                {mapping.timestamp || "No timestamp available"}
              </p>
              <button
                onClick={() => handleDelete(mapping.id)}
                className={styles.deleteButton}
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
