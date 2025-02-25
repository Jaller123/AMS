import React, { useState, useEffect } from "react";
import styles from "./MappingsPage.module.css";

const RequestEditor = ({
  mappingId,
  editedRequest,
  setEditedRequest,
  handleUpdateRequest,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // localRequest contains a urlMatchType field to choose which key to use.
  const [localRequest, setLocalRequest] = useState({
    title: "",
    url: "",
    urlMatchType: "url", // default: Exact URL
    method: "",
    headers: "{}",
    body: "{}",
  });

  // Helper: determine the current URL matching option from editedRequest.
  const determineURLMatchType = (reqObj) => {
    if (!reqObj) return "url";
    if (reqObj.urlPath) return "urlPath";
    if (reqObj.urlPathPattern) return "urlPathPattern";
    if (reqObj.urlPathTemplate) return "urlPathTemplate";
    if (reqObj.urlPattern) return "urlPattern";
    if (reqObj.url) return "url";
    return "url";
  };

  useEffect(() => {
    if (editedRequest) {
      setLocalRequest({
        title: editedRequest.title || "",
        url:
          editedRequest.url ||
          editedRequest.urlPath ||
          editedRequest.urlPathPattern ||
          editedRequest.urlPathTemplate ||
          editedRequest.urlPattern ||
          "",
        urlMatchType: determineURLMatchType(editedRequest),
        method: editedRequest.method || "",
        headers: JSON.stringify(editedRequest.headers || {}, null, 2),
        body: editedRequest.bodyPatterns
          ? JSON.stringify(editedRequest.bodyPatterns[0].equalToJson || {}, null, 2)
          : JSON.stringify(editedRequest.body || {}, null, 2),
      });
    }
  }, [editedRequest]);

  const saveRequest = () => {
    try {
      // Parse headers and body.
      const parsedHeaders = JSON.parse(localRequest.headers || "{}");
      const parsedBody = JSON.parse(localRequest.body || "{}");

      let updatedRequest = {};
      if (localRequest.title) {
        updatedRequest.title = localRequest.title;
      }
      // Use the selected URL matching option as the key.
      if (localRequest.url) {
        updatedRequest[localRequest.urlMatchType] = localRequest.url;
      }
      updatedRequest.method = localRequest.method.toUpperCase();
      updatedRequest.headers = Object.fromEntries(
        Object.entries(parsedHeaders).map(([key, value]) => {
          if (typeof value === "object" && value !== null && "equalTo" in value) {
            return [key, value];
          } else {
            return [key, { equalTo: value }];
          }
        })
      );
      if (localRequest.body && Object.keys(parsedBody).length > 0) {
        updatedRequest.bodyPatterns = [{ equalToJson: parsedBody }];
      }

      // Update using the handler.
      handleUpdateRequest(mappingId, updatedRequest);
      setIsEditing(false);
    } catch (error) {
      alert("Invalid JSON in headers or body.");
    }
  };

  return (
    <div className={styles.RequestEditor}>
      <h4>Request</h4>
      {isEditing ? (
        <div>
          <label htmlFor="title">Title</label>
          <input
            placeholder="Title"
            type="text"
            
            value={localRequest.title}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, title: e.target.value })
            }
          />
          <label htmlFor="urlMatchType">URL Matching Option</label>
          <select
            id="urlMatchType"
            data-testid="url-match-type-select" 
            value={localRequest.urlMatchType}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, urlMatchType: e.target.value })
            }
          >
            <option value="url">Exact URL</option>
            <option value="urlPath">URL Path</option>
            <option value="urlPathPattern">URL Path Pattern</option>
            <option value="urlPathTemplate">URL Path Template</option>
            <option value="urlPattern">URL Pattern</option>
          </select>
          <label htmlFor="url">URL</label>
          <input
            placeholder="URL"
            type="text"
            data-testid="url-input-field"
            value={localRequest.url}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, url: e.target.value })
            }
          />
          <label htmlFor="method">Method</label>
          <input
            placeholder="Method"
            type="text"
            value={localRequest.method}
            onChange={(e) =>
              setLocalRequest({ ...localRequest, method: e.target.value })
            }
          />
          <label htmlFor="headers">Headers (JSON)</label>
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
          <pre>
            {JSON.stringify(
              (() => {
                // Reconstruct the saved request exactly.
                let obj = {};
                if (editedRequest?.title) obj.title = editedRequest.title;
                const keys = ["url", "urlPath", "urlPathPattern", "urlPathTemplate", "urlPattern"];
                for (let key of keys) {
                  if (editedRequest && editedRequest[key]) {
                    obj[key] = editedRequest[key];
                    break;
                  }
                }
                obj.method = editedRequest?.method || "";
                obj.headers = editedRequest?.headers || "";
                obj.body = editedRequest?.bodyPatterns
                  ? editedRequest.bodyPatterns[0].equalToJson
                  : editedRequest?.body || "";
                return obj;
              })(),
              null,
              2
            )}
          </pre>
          <button onClick={() => setIsEditing(true)}>Edit Request</button>
        </div>
      )}
    </div>
  );
};

export default RequestEditor;
