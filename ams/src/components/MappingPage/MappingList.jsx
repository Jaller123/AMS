import React from "react";
import MappingItem from "./MappingItem";

const MappingList = ({
  mappings = [],
  handleSendToWireMock,
  responses,
  expandedMappings,
  setExpandedMappings,
  editedRequests,
  setEditedRequests,
  editedResponses,
  setEditedResponses,
  selectedResponses,
  setSelectedResponses,
  handleDelete,
  handleUpdateRequest,
  handleUpdateResponse,
  autoExpandMappingId, // receive the auto-expand id here
}) => {
  return (
    <ul>
      {mappings.map((mapping) => (
        <MappingItem
          key={mapping.id}
          mapping={mapping}
          responses={responses}
          expandedMappings={expandedMappings}
          setExpandedMappings={setExpandedMappings}
          editedRequests={editedRequests}
          setEditedRequests={setEditedRequests}
          editedResponses={editedResponses}
          setEditedResponses={setEditedResponses}
          selectedResponses={selectedResponses}
          setSelectedResponses={setSelectedResponses}
          handleDelete={handleDelete}
          handleUpdateRequest={handleUpdateRequest}
          handleUpdateResponse={handleUpdateResponse}
          handleSendToWireMock={handleSendToWireMock}
          autoExpandMappingId={autoExpandMappingId} // pass it down
        />
      ))}
    </ul>
  );
};

export default MappingList;
