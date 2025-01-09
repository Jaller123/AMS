import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./MappingDetailPage.module.css";

const MappingDetailPage = ({
  mappings,
  responses,
  handleUpdateRequest,
  handleUpdateResponse,
  handleDelete,
}) => {
  const { mappingId } = useParams();
  const navigate = useNavigate();

  const mapping = mappings.find((m) => String(m.id) === String(mappingId));
  const relevantResponses = responses.filter(
    (res) => String(res.reqId) === String(mappingId)
  );

  if (!mapping) {
    return <p>No mapping found for ID: {mappingId}</p>;
  }

  const [selectedResponse, setSelectedResponse] = useState(
    relevantResponses.length > 0 ? relevantResponses[0] : null
  );

  // States for editing request and response
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editedRequest, setEditedRequest] = useState(mapping.request);

  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState(
    selectedResponse ? selectedResponse.resJson : null
  );

  const handleEditRequestClick = () => {
    setIsEditingRequest(true);
  };

  const handleSaveRequestClick = () => {
    handleUpdateRequest(mapping.id, editedRequest);
    setIsEditingRequest(false);
    alert("Request updated successfully!");
  };

  const handleEditResponseClick = () => {
    setIsEditingResponse(true);
  };

  const handleSaveResponseClick = () => {
    if (selectedResponse && editedResponse) {
      handleUpdateResponse(selectedResponse.id, editedResponse);
      setIsEditingResponse(false);
      alert("Response updated successfully!");
    }
  };

  const handleDeleteClick = () => {
    handleDelete(mappingId);
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <h2>Mapping Details</h2>
      <div>
        <h3>Request</h3>
        {isEditingRequest ? (
          <textarea
            className={styles.textarea}
            value={JSON.stringify(editedRequest, null, 2)}
            onChange={(e) => setEditedRequest(JSON.parse(e.target.value))}
          />
        ) : (
          <pre>{JSON.stringify(mapping.request, null, 2)}</pre>
        )}
        <button
          onClick={
            isEditingRequest ? handleSaveRequestClick : handleEditRequestClick
          }
          className={isEditingRequest ? styles.saveButton : styles.editButton}
        >
          {isEditingRequest ? "Save Request" : "Edit Request"}
        </button>
      </div>
      <div>
        <h3>Response</h3>
        {isEditingResponse ? (
          <textarea
            className={styles.textarea}
            value={JSON.stringify(editedResponse, null, 2)}
            onChange={(e) => setEditedResponse(JSON.parse(e.target.value))}
          />
        ) : (
          <pre>{JSON.stringify(selectedResponse?.resJson, null, 2)}</pre>
        )}
        <button
          onClick={
            isEditingResponse
              ? handleSaveResponseClick
              : handleEditResponseClick
          }
          className={isEditingResponse ? styles.saveButton : styles.editButton}
        >
          {isEditingResponse ? "Save Response" : "Edit Response"}
        </button>
      </div>
      <button onClick={handleDeleteClick} className={styles.deleteButton}>
        Delete Mapping
      </button>
    </div>
  );
};

export default MappingDetailPage;
