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
  filteredMappings,
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
      {/* Header Row */}
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
        {/* If handleRemoveMapping is passed in, show a remove button */}
        {handleRemoveMapping && (
          <button
            className={styles.removeMapping}
            onClick={(e) => {
              e.stopPropagation(); // so it doesn’t toggle expand
              handleRemoveMapping(id);
            }}
          >
            ❌
          </button>
        )}
      </div>

      {/* Expanded details */}
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
                {JSON.stringify(res.resJson, null, 2)}
              </pre>
            ))}
        </div>
      )}
    </li>
  );
};

export default ScenarioMappingItem;
