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
    cy.contains("Edit Response").click();

    // Update the response status and save
    cy.get('input[placeholder="Status"]').clear().type("404");
    cy.contains("Save Response").click();

    // Verify the update
    cy.contains("404").should("exist");
  });

  it("should add a new response and navigate", () => {
    cy.contains("Show Details").click();
    cy.contains("Add New Response").click();

    // Verify navigation to add response page
    cy.url().should("eq", "http://localhost:5173/request/1");
  });

  it("should delete a mapping", () => {
    cy.contains("Delete Mapping").click();

    // Verify the mapping is removed
    cy.contains("POST").should("not.exist");
    cy.contains("/test").should("not.exist");
    cy.contains("test2").should("not.exist");
  });
});
