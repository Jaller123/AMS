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
              <strong>Method:</strong> {mapping.request.method} <br />
              <strong>URL:</strong> {mapping.request.url} <br />
              <strong>Status:</strong> {mapping.response.status} <br />
              <strong>Headers:</strong>{" "}
              {JSON.stringify(mapping.response.headers, null, 2)} <br />
              <strong>Body:</strong>{" "}
              {JSON.stringify(mapping.response.body, null, 2)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MappingsPage;
