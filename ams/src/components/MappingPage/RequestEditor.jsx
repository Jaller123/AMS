import React, { useState, useEffect } from "react";
import styles from "./MappingsPage.module.css";

const RequestEditor = ({
  mappingId,
  editedRequest,
  setEditedRequest,
  handleUpdateRequest,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localRequest, setLocalRequest] = useState({
    url: "",
    method: "",
    headers: "{}",
    body: "{}",
  });

  // Initialize localRequest with values from editedRequest, excluding title
  useEffect(() => {
    if (editedRequest) {
      setLocalRequest({
        url: editedRequest.url || "",
        method: editedRequest.method || "",
        headers: JSON.stringify(editedRequest.headers || {}, null, 2),
        body: JSON.stringify(editedRequest.body || {}, null, 2),
      });
    }
  }, [editedRequest]);

  const saveRequest = () => {
    try {
      // Remove 'title' from the request JSON
      const updatedRequest = {
        ...localRequest,
        headers: JSON.parse(localRequest.headers || "{}"),
        body: JSON.parse(localRequest.body || "{}"),
      };

      // Call the handler to update the request (without the title field)
      handleUpdateRequest(mappingId, updatedRequest);
      setIsEditing(false);
    } catch (error) {
      alert("Invalid JSON in headers or body.");
    }
  };

  return (
    <div>
      <h4>Request</h4>
      {isEditing ? (
        <div>
          <label>URL</label>
          <input
            placeholder="Url"
            type="text"
            value={localRequest.url}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, url: e.target.value })
            }
          />
          <label>Method</label>
          <input
            placeholder="Method"
            type="text"
            value={localRequest.method}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, method: e.target.value })
            }
          />
          <label>Headers (JSON)</label>
          <textarea
            value={localRequest.headers}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, headers: e.target.value })
            }
          />
          <label>Body (JSON)</label>
          <textarea
            value={localRequest.body}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, body: e.target.value })
            }
          />
          <button onClick={saveRequest}>Save Request</button>
        </div>
      ) : (
        <div>
          {/* Display the request without title */}
          <pre>{JSON.stringify(
            {
              url: editedRequest.url,
              method: editedRequest.method,
              headers: editedRequest.headers,
              body: editedRequest.body,
            },
            null,
            2
          )}</pre>
          <button onClick={() => setIsEditing(true)}>Edit Request</button>
        </div>
      )}
    </div>
  );
};




export default RequestEditor;
