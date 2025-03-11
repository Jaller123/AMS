import React from "react";
import styles from "./CreateScenario.module.css";

const ScenarioMappingItem = ({
  mapping,
  responses,
  expanded,
  toggleMappingDropdown,
  handleDragStartMapping,
  handleDragEndMapping,
  handleRemoveMapping,
  draggingMappingId,
}) => {
  return (
    <li
      className={styles.scenarioMappingItem}
      onDragStart={(e) => handleDragStartMapping(e, mapping)}
      onDragEnd={handleDragEndMapping}
      draggable
      style={{
        cursor: "grab",
        opacity: draggingMappingId === mapping.id ? 0.6 : 1,
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
    >
      <div
        className={styles.mappingHeader}
        onClick={() => toggleMappingDropdown(mapping.id)}
      >
        <span>
          <strong>{mapping.request?.method || "METHOD"}</strong> |{" "}
          {mapping.request?.url || "No URL"} |{" "}
          {mapping.request?.title || "No Title"}
        </span>
        <button
          className={styles.removeMapping}
          onClick={() => handleRemoveMapping(mapping.id)}
        >
          ❌
        </button>
      </div>
      {expanded && (
        <div className={styles.mappingDetails}>
          <h3>Request</h3>
          <pre className={styles.preFormatted}>
            {JSON.stringify(mapping.request, null, 2)}
          </pre>
        </div>
      )}
    </li>
  );
};

export default ScenarioMappingItem;
