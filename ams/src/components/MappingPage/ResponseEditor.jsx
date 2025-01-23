import React from "react";

const ResponseEditor = ({
  mappingId,
  relevantResponses,
  editedResponse,
  setEditedResponse,
  selectedResponse,
  setSelectedResponse,
  handleUpdateResponse,
}) => {
  const saveResponse = () => {
    try {
      const updatedResponse = {
        ...editedResponse,
        headers: JSON.parse(editedResponse.headers || "{}"),
        body: JSON.parse(editedResponse.body || "{}"),
      };
      handleUpdateResponse(selectedResponse, updatedResponse);
    } catch (error) {
      alert("Invalid JSON in headers or body.");
    }
  };

  return (
    <div>
      <h4>Response Editor</h4>
      <select
        value={selectedResponse || ""}
        onChange={(e) => {
          const response = relevantResponses.find((res) => res.id === e.target.value);
          setSelectedResponse(response?.id || "");
          setEditedResponse({
            status: response?.resJson?.status || "",
            headers: JSON.stringify(response?.resJson?.headers || {}, null, 2),
            body: JSON.stringify(response?.resJson?.body || {}, null, 2),
          });
        }}
      >
        {relevantResponses.map((response) => (
          <option key={response.id} value={response.id}>
            {response.id} - {response.resJson?.status || "No Status"}
          </option>
        ))}
      </select>
      <label>Status</label>
      <input
        type="text"
        value={editedResponse?.status || ""}
        onChange={(e) => setEditedResponse({ ...editedResponse, status: e.target.value })}
      />
      <label>Headers (JSON)</label>
      <textarea
        value={editedResponse?.headers || "{}"}
        onChange={(e) => setEditedResponse({ ...editedResponse, headers: e.target.value })}
      />
      <label>Body (JSON)</label>
      <textarea
        value={editedResponse?.body || "{}"}
        onChange={(e) => setEditedResponse({ ...editedResponse, body: e.target.value })}
      />
      <button onClick={saveResponse}>Save Response</button>
    </div>
  );
};

export default ResponseEditor;
