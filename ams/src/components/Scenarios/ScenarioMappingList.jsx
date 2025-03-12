import React from "react";
import ScenarioMappingItem from "./ScenarioMappingItem";
import styles from "./CreateScenario.module.css";
import useMappingSearch from "./useMappingSearch";
import SortControls from "../MappingPage/SortControls";

const ScenarioMappingList = ({
  mappings,
  responses,
  scenarioName,
  setScenarioName,
  newScenarioMappings,
  expandedMappingId,
  toggleMappingDropdown,
  handleDragStartMapping,
  handleDragEndMapping,
  handleDragOverDropZone,
  handleDragLeaveDropZone,
  handleDropOnDropZone,
  highlighted,
  handleRemoveMapping,
  draggingMappingId,
  expandMappingIdLeft,
  expandMappingIdRight,
  toggleMappingDropdownLeft,
  toggleMappingDropdownRight,
  handleSaveNewScenario
}) => {

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
    <ul>
      <SortControls 
      setSortCriterion={setSortCriterion}
      searchFilters={searchFilters}
      setSearchFilters={setSearchFilters}
      search={search}
      filteredMappings={filteredMappings}
      setSearch={setSearch}
      sortCriterion={sortCriterion}
      />
          <ScenarioMappingItem
            responses={responses}
            scenarioName={scenarioName}
            setScenarioName={setScenarioName}
            filteredMappings={filteredMappings}
            searchFilters={searchFilters}
            newScenarioMappings={newScenarioMappings}
            expandMappingIdLeft={expandMappingIdLeft}
            expandMappingIdRight={expandMappingIdRight}
            toggleMappingDropdown={toggleMappingDropdown}
            handleDragStartMapping={handleDragStartMapping}
            handleDragEndMapping={handleDragEndMapping}
            handleDragOverDropZone={handleDragOverDropZone}
            handleDragLeaveDropZone={handleDragLeaveDropZone}
            highlighted={highlighted}
            handleDropOnDropZone={handleDropOnDropZone}
            handleRemoveMapping={handleRemoveMapping}
            draggingMappingId={draggingMappingId}
            toggleMappingDropdownLeft={toggleMappingDropdownLeft}
            toggleMappingDropdownRight={toggleMappingDropdownRight}
            handleSaveNewScenario={handleSaveNewScenario}
          />
    </ul>
  );
};

export default ScenarioMappingList;
