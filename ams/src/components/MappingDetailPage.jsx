import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();


  const mapping = mappings.find((m) => String(m.id) === String(mappingId)) || null;
  const relevantResponses = responses.filter(
    (res) => String(res.reqId) === String(mappingId)
  );

  const initialSelectedResponseId = location.state?.selectedResponseId || null;
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editedRequest, setEditedRequest] = useState("");
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState("");

  // Initialize state values on the first render or when mappingId changes
  useEffect(() => {
    if (mapping) {
      setEditedRequest((prev) => prev || JSON.stringify(mapping.request, null, 2));
    }

    // Set the selected response based on the passed response ID
    if (initialSelectedResponseId) {
      const foundResponse = relevantResponses.find(
        (res) => res.id === initialSelectedResponseId
      );
      if (foundResponse) {
        setSelectedResponse(foundResponse);
        setEditedResponse(JSON.stringify(foundResponse.resJson, null, 2));
      }
    } else if (relevantResponses.length > 0) {
      setSelectedResponse(relevantResponses[0]);
      setEditedResponse(JSON.stringify(relevantResponses[0]?.resJson || {}, null, 2));
    }
  }, [mapping, relevantResponses, initialSelectedResponseId]);

  const handleEditRequestClick = () => {
    setIsEditingRequest(true);
  };

  const handleSaveRequestClick = () => {
    try {
      const parsedRequest = JSON.parse(editedRequest);
      handleUpdateRequest(mapping.id, parsedRequest);
      setIsEditingRequest(false);
      alert("Request updated successfully!");
    } catch {
      alert("Invalid JSON format in the request.");
    }
  };

  const handleEditResponseClick = () => {
    setIsEditingResponse(true);
  };

  const handleSaveResponseClick = () => {
    try {
      const parsedResponse = JSON.parse(editedResponse);
      if (selectedResponse) {
        handleUpdateResponse(selectedResponse.id, parsedResponse);
        setIsEditingResponse(false);
        alert("Response updated successfully!");
      }
    } catch {
      alert("Invalid JSON format in the response.");
    }
  };

  const handleDeleteClick = () => {
    handleDelete(mappingId);
    navigate("/");
  };

  if (!mapping) {
    return <p>No mapping found for ID: {mappingId}</p>;
  }

  return (
    <div className={styles.container}>
      <h2>Mapping Details</h2>
      <div>
        <h3>Request</h3>
        {isEditingRequest ? (
          <textarea
            className={styles.textarea}
            value={editedRequest}
            onChange={(e) => setEditedRequest(e.target.value)} // Allow free typing
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
            value={editedResponse}
            onChange={(e) => setEditedResponse(e.target.value)} // Allow free typing
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
