import React from "react";
import ScenarioMappingItem from "./ScenarioMappingItem";
import styles from "./CreateScenario.module.css";

const ScenarioMappingList = ({
  mappings = [], // Ensure mappings is always an array
  responses = [],
  expandedMappingId,
  toggleMappingDropdown,
  handleDragStartMapping,
  handleDragEndMapping,
  handleRemoveMapping,
  draggingMappingId,
}) => {
  return (
    <ul className={styles.scenarioMappingList}>
      {mappings.length > 0 ? (
        mappings.map((mapping, index) => (
          <ScenarioMappingItem
            key={mapping.id || index}
            mapping={mapping}
            responses={responses}
            expanded={expandedMappingId === mapping.id}
            toggleMappingDropdown={toggleMappingDropdown}
            handleDragStartMapping={handleDragStartMapping}
            handleDragEndMapping={handleDragEndMapping}
            handleRemoveMapping={handleRemoveMapping}
            draggingMappingId={draggingMappingId}
          />
        ))
      ) : (
        <p>No mappings available</p>
      )}
    </ul>
  );
};

export default ScenarioMappingList;
