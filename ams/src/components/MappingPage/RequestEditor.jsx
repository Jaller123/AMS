import React from "react";

const RequestEditor = ({ mappingId, editedRequest, setEditedRequest, handleUpdateRequest }) => {
  const saveRequest = () => {
    try {
      const updatedRequest = {
        ...editedRequest,
        headers: JSON.parse(editedRequest.headers || "{}"),
        body: JSON.parse(editedRequest.body || "{}"),
      };
      handleUpdateRequest(mappingId, updatedRequest);
    } catch (error) {
      alert("Invalid JSON in headers or body.");
    }
  };

  return (
    <div>
      <h4>Request Editor</h4>
      <label>URL</label>
      <input
        type="text"
        value={editedRequest?.url || ""}
        onChange={(e) => setEditedRequest({ ...editedRequest, url: e.target.value })}
      />
      <label>Method</label>
      <input
        type="text"
        value={editedRequest?.method || ""}
        onChange={(e) => setEditedRequest({ ...editedRequest, method: e.target.value })}
      />
      <label>Headers (JSON)</label>
      <textarea
        value={editedRequest?.headers || "{}"}
        onChange={(e) => setEditedRequest({ ...editedRequest, headers: e.target.value })}
      />
      <label>Body (JSON)</label>
      <textarea
        value={editedRequest?.body || "{}"}
        onChange={(e) => setEditedRequest({ ...editedRequest, body: e.target.value })}
      />
      <button onClick={saveRequest}>Save Request</button>
    </div>
  );
};

export default RequestEditor;
