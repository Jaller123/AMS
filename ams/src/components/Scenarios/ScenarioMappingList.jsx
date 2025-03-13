import React from "react";
import ScenarioMappingItem from "./ScenarioMappingItem";
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
}) => {
  if (!mappings.length) {
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
  } = useMappingSearch(mappings)

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
        {filteredMappings.map((mapping) => (
        <ScenarioMappingItem
          key={mapping.id}
          mapping={mapping}
          responses={responses}
          expanded={expandId === mapping.id}
          onToggleExpand={onToggleExpand}
          draggingMappingId={draggingMappingId}
          handleDragStartMapping={handleDragStartMapping}
          handleDragEndMapping={handleDragEndMapping}
          handleRemoveMapping={handleRemoveMapping}
        />
      ))}
    </ul>
  );
};

export default ScenarioMappingList;
