describe("Mappings Page Functionalities", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              title: "test2",
              url: "/test",
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
          },
        ],
        responses: [
          {
            id: "1.1",
            reqId: "1",
            resJson: {
              status: "200",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
          },
        ],
      },
    }).as("getMappings");

    cy.visit("http://localhost:5173");
    cy.wait("@getMappings");
  });

  it("should display method, URL, and title in collapsed mapping", () => {
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  });

  it("should filter mappings based on title, URL, and method", () => {
    // Check filtering by title
    cy.get('input[placeholder="Search by Title"]').type("test2");
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  
    // Clear title filter and verify mapping is still visible
    cy.get('input[placeholder="Search by Title"]').clear();
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  
    // Check filtering by URL
    cy.get('input[placeholder="Search by URL"]').type("/test");
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  
    // Clear URL filter and verify mapping is still visible
    cy.get('input[placeholder="Search by URL"]').clear();
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  
    // Check filtering by method
    cy.get('input[placeholder="Search by Method"]').type("POST");
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  
    // Clear method filter and verify mapping is still visible
    cy.get('input[placeholder="Search by Method"]').clear();
    cy.contains("POST").should("exist");
    cy.contains("/test").should("exist");
    cy.contains("test2").should("exist");
  });

  it("should expand mapping and view request details", () => {
    cy.contains("Show Details").click();

    // Verify request details
    cy.contains("Request").should("exist");
    cy.contains('"title": "test2"').should("exist");
    cy.contains('"url": "/test"').should("exist");
    cy.contains('"method": "POST"').should("exist");
    cy.contains('"Content-Type": "text/plain"').should("exist");
    cy.contains('"body": "test1"').should("exist");
  });

  it("should edit and save a request", () => {
    cy.contains("Show Details").click();
    cy.contains("Edit Request").click();

    // Update the request title and save
    cy.get('input[placeholder="Title"]').clear().type("Updated Test Title");
    cy.contains("Save Request").click();

    // Verify the update
    cy.contains("Updated Test Title").should("exist");
  });

  it("should view response details", () => {
    cy.contains("Show Details").click();

    // Verify response details
    cy.contains("Response").should("exist");
    cy.contains("200").should("exist");
    cy.contains('"Content-Type": "text/plain"').should("exist");
    cy.contains('"body": "test1"').should("exist");
  });

  it("should edit and save a response", () => {
    cy.contains("Show Details").click();
  
    // Enter editing mode
    cy.contains("Edit Response").click();
  
    // Clear and update the body field
    cy.get('textarea[placeholder="Body"]')
      .clear()
      .type('{"body":"updated response body"}', { parseSpecialCharSequences: false });
  
    // Save the updated response
    cy.contains("Save Response").click();
  
    // Verify the updated response
    cy.get("pre").should("contain.text", '"body": "updated response body"');
  });

  it("should view response details", () => {
    cy.contains("Show Details").click();

    // Verify response details
    cy.contains("Response").should("exist");
    cy.contains("200").should("exist");
    cy.contains('"Content-Type": "text/plain"').should("exist");
    cy.contains('"body": "test1"').should("exist");
  });

  it("should add a new response, navigate and choose the new response", () => {
    // Open the details view
    cy.contains("Show Details").click();
    cy.contains("Add New Response").click();
  
    // Verify navigation to the add response page
    cy.url().should("eq", "http://localhost:5173/request/1");
  
    // Fill in the new response details
    cy.get('input[placeholder="e.g., 200"]').type("201");
    cy.get('textarea[placeholder=\'{"Content-Type":"application/json"}\']')
      .clear()
      .type('{"Content-Type":"application/json"}', { parseSpecialCharSequences: false });
    cy.get('textarea[placeholder=\'{"key": "value"}\']')
      .clear()
      .type('{"body":"new response body"}', { parseSpecialCharSequences: false });
  
    // Mock the POST response and ensure it completes
    cy.intercept("POST", "http://localhost:8080/responses").as("saveResponse");
    cy.contains("Save Response").click();
    cy.wait("@saveResponse");
  
    // Register the intercept for updated mappings before navigating back
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              title: "Updated Test Title",
              url: "/test",
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
          },
        ],
        responses: [
          {
            id: "1.1",
            reqId: "1",
            resJson: {
              status: "200",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
          },
          {
            id: "1.2",
            reqId: "1",
            resJson: {
              status: "201",
              headers: { "Content-Type": "application/json" },
              body: { body: "new response body" },
            },
          },
        ],
      },
    }).as("updatedMappings");
  
    // Navigate back to mappings
    cy.contains("Back to Mappings").click();
  
    // Verify the dropdown contains the new response
    cy.contains("Show Details").click();
    cy.get("select[placeholder='Select Response'] option")
      .should("have.length", 2)
      .and("contain", "201");
  
    // Select and verify the new response details
    cy.get("select[placeholder='Select Response']").select("1.2").should("contain", "201");
    cy.get("pre").should("contain.text", '"status": "201"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/json"');
    cy.get("pre").should("contain.text", '"body": "new response body"');
  });
  
  it("should delete a mapping", () => {
    cy.wait(500);
    cy.contains("Show Details").click();
    cy.get('button[placeholder="Delete Button"]').click();
    cy.contains("POST").should("not.exist");
    cy.contains("/test").should("not.exist");
    cy.contains("test2").should("not.exist");
  });
});
