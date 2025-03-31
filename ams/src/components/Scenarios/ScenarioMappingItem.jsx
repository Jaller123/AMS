import React from "react";

const ScenarioMappingItem = ({
  mapping,
  responses,
  expanded,
  onToggleExpand,
  draggingMappingId,
  handleDragStartMapping,
  handleDragEndMapping,
  handleRemoveMapping,
  handleAddToScenario, // Function passed as prop
}) => {
  return (
    <li className={styles.mappingItem}>
      <div
        className={styles.mappingHeader}
        onClick={() => onToggleExpand(mapping.id)} // Expandera eller kollapsa mappning
        draggable
        onDragStart={(e) => handleDragStartMapping(e, mapping)}
        onDragEnd={handleDragEndMapping}
      >
        <span>{mapping.name}</span>
        <button
          className={styles.addButton}
          onClick={() => handleAddToScenario(mapping.id)} // Lägg till mappning i scenario
        >
          + Add to Scenario
        </button>
        <button
          className={styles.removeButton}
          onClick={() => handleRemoveMapping(mapping.id)} // Ta bort mappning från scenario
        >
          ❌ Remove
        </button>
      </div>

      {expanded && (
        <div className={styles.mappingDetails}>
          <h3>Details for {mapping.name}</h3>
          {/* Här kan du lägga till mer information om mappningen */}
          <pre>{JSON.stringify(mapping, null, 2)}</pre>
        </div>
      )}
    </li>
  );
};

export default ScenarioMappingItem;
