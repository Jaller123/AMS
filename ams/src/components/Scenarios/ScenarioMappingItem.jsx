import React from "react";
import styles from "./CreateScenario.module.css";

const ScenarioMappingItem = ({
  mapping,
  responses,
  expanded,
  onToggleExpand,
  draggingMappingId,
  handleDragStartMapping,
  handleDragEndMapping,
  handleRemoveMapping,
  handleAddToScenario, // Passed as prop
}) => {
  const { id, request } = mapping;

  return (
    <li
      className={styles.mappingItem}
      draggable
      onDragStart={(e) => handleDragStartMapping(e, mapping)}
      onDragEnd={handleDragEndMapping}
      style={{
        cursor: "grab",
        opacity: draggingMappingId === id ? 0.6 : 1,
      }}
    >
      <div
        className={styles.mappingHeader}
        onClick={() => onToggleExpand?.(id)}
      >
        <span>
          <strong>{mapping.request?.method || "METHOD"}</strong> |{" "}
          {mapping.request?.url ||
            mapping.request?.urlPath ||
            mapping.request?.urlPathPattern ||
            mapping.request?.urlPathTemplate ||
            mapping.request?.urlPattern ||
            "No URL"}{" "}
          | {mapping.request?.title || "No Title"}
        </span>
        {handleAddToScenario && (
          <button
            className={styles.addToScenarioButton}
            onClick={(e) => {
              e.stopPropagation(); // Prevent expand toggle
              handleAddToScenario(id); // Adds mapping to scenario
            }}
          >
            Add to Scenario
          </button>
        )}
        {handleRemoveMapping && (
          <button
            className={styles.removeMapping}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveMapping(id);
            }}
          >
            ❌
          </button>
        )}
      </div>

      {expanded && (
        <div className={styles.mappingDetails}>
          <h3>Request</h3>
          <pre className={styles.preFormatted}>
            {JSON.stringify(request, null, 2)}
          </pre>
          <h3>Responses</h3>
          {responses
            .filter((res) => res.reqId === id)
            .map((res) => (
              <pre key={res.id} className={styles.preFormatted}>
                {JSON.stringify(res, null, 2)}
              </pre>
            ))}
        </div>
      )}
    </li>
  );
};

export default ScenarioMappingItem;
