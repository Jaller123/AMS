import React from "react";
import ScenarioMappingItem from "./ScenarioMappingItem"; // Jag antar att du har en komponent för varje mappning
import styles from "./CreateScenario.module.css";
import useMappingSearch from "./useMappingSearch";
import SortControls from "../MappingPage/SortControls";

const ScenarioMappingList = ({
  mappings,
  responses,
  expanded,
  expandId,
  onToggleExpand,
  draggingMappingId,
  handleDragStartMapping,
  handleDragEndMapping,
  handleRemoveMapping,
  handleAddToScenario,
}) => {
  if (!mappings || mappings.length === 0) {
    return <p>No Mappings Found.</p>;
  }

  const {
    filteredMappings,
    search,
    setSearch,
    searchFilters,
    setSearchFilters,
    sortCriterion,
    setSortCriterion,
  } = useMappingSearch(mappings);

  return (
    <ul className={styles.headerScenarioMappings}>
      <SortControls
        setSortCriterion={setSortCriterion}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        search={search}
        filteredMappings={filteredMappings}
        setSearch={setSearch}
        sortCriterion={sortCriterion}
      />
      {Array.isArray(filteredMappings) &&
        filteredMappings.map((mapping, index) => {
          console.log(`Index: ${index}, Mapping ID:`, mapping.id);
          return (
            <ScenarioMappingItem
              key={mapping.id || `fallback-key-${index}`} // Om ID saknas, använd ett fallback-värde
              mapping={mapping}
              responses={responses}
              expanded={expandId === mapping.id}
              onToggleExpand={onToggleExpand}
              draggingMappingId={draggingMappingId}
              handleDragStartMapping={handleDragStartMapping}
              handleDragEndMapping={handleDragEndMapping}
              handleRemoveMapping={handleRemoveMapping}
              handleAddToScenario={handleAddToScenario}
            />
          );
        })}
    </ul>
  );
};

export default ScenarioMappingList;
