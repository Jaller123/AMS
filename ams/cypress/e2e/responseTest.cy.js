describe("Mappings Page - Response Functionalities", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
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

  it("should edit an existing response and verify changes", () => {
    cy.contains("Show Details").click();

    // Enter editing mode
    cy.contains("Edit Response").click();

    // Modify response status
    cy.get('input[placeholder="Status"]').clear().type("202");

    // Modify response headers
    cy.get("textarea")
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/xml"}', {
        parseSpecialCharSequences: false,
      });

    // Modify response body
    cy.get("textarea").eq(1).clear().type('{"body":"updated response"}', {
      parseSpecialCharSequences: false,
    });

    // Save the updated response
    cy.contains("Save Response").click();

    // Verify the updated response details
    cy.get("pre").should("contain.text", '"status": "202"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/xml"');
    cy.get("pre").should("contain.text", '"body": "updated response"');
  });

  it("should add a new response, navigate back, and select the latest response", () => {
    cy.contains("Show Details").click();
    cy.contains("Add New Response").click();

    // Verify navigation to Add Response page
    cy.url().should("match", /\/request\/\d+/);

    // Fill in new response details
    cy.get('input[placeholder="Status"]').type("201");
    cy.get("textarea")
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/json"}', {
        parseSpecialCharSequences: false,
      });
    cy.get("textarea").eq(1).clear().type('{"body":"new response body"}', {
      parseSpecialCharSequences: false,
    });

    // Mock the POST request for saving the response
    cy.intercept("POST", "http://localhost:8080/responses").as("saveResponse");
    cy.contains("Save Response").click();
    cy.wait("@saveResponse");

    // Mock the GET request for updated mappings before returning to mappings
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
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
              status: "202",
              headers: { "Content-Type": "application/xml" },
              body: { body: "updated response" },
            },
          },
          {
            id: "1.3",
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

    // Navigate back to Mappings Page
    cy.contains("Back to Mappings").click();

    // Verify new response exists in dropdown dynamically
    cy.contains("Show Details").click();

    // Get the last (latest) response option dynamically
    cy.get("select[placeholder='Select Response'] option")
      .last()
      .then(($latestResponse) => {
        const latestResponseText = $latestResponse.text();
        cy.get("select[placeholder='Select Response']").select(
          latestResponseText
        );
      });

    // Verify the latest response details dynamically
    cy.get("pre").should("contain.text", '"status": "201"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/json"');
    cy.get("pre").should("contain.text", '"body": "new response body"');
  });
});
