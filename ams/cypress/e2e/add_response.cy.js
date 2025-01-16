describe("ReqDetailPage Tests", () => {
    beforeEach(() => {
      // Intercept the backend API response for mappings
      cy.intercept("GET", "http://localhost:8080/mappings", {
        statusCode: 200,
        body: {
          requests: [
            {
              id: "1",
              resJson: {
                title: "Test 1",
                url: "/user",
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: { body: "Hello World" },
              },
            },
          ],
          responses: [],
        },
      }).as("getMappings");
  
      // Visit the ReqDetailPage directly
      cy.visit("http://localhost:5173/request/1");
      cy.wait("@getMappings");
    });
  
    it("should display the correct request details", () => {
      // Verify the request data is displayed correctly
      cy.contains("Request Details").should("exist");
      cy.contains('"title": "Test 1"').should("exist");
      cy.contains('"url": "/user"').should("exist");
      cy.contains('"method": "POST"').should("exist");
      cy.contains('"Content-Type": "text/plain"').should("exist");
      cy.contains('"body": "Hello World"').should("exist");
    });
  
    it("should allow creating a new response", () => {
      // Fill in the form for creating a new response
      cy.get('input[type="text"]').clear().type("201");
      cy.get('textarea').eq(0).clear().type('{"Content-Type": "application/json"}', {
        parseSpecialCharSequences: false,
      });
      cy.get('textarea').eq(1).clear().type('{"message": "Success"}', {
        parseSpecialCharSequences: false,
      });
  
      // Intercept the POST request for saving the response
      cy.intercept("POST", "http://localhost:8080/responses", {
        statusCode: 200,
        body: {
          success: true,
          newResponse: {
            id: "1.1",
            reqId: "1",
            resJson: {
              status: "201",
              headers: { "Content-Type": "application/json" },
              body: { message: "Success" },
            },
            timestamp: new Date().toISOString(),
          },
        },
      }).as("saveResponse");
  
      // Save the response
      cy.contains("Save Response").click();
  
      // Wait for the POST request to complete and assert the response
      cy.wait("@saveResponse").its("response.statusCode").should("eq", 200);
  
      // Optionally, confirm that the form fields are cleared after saving
      cy.get('input[type="text"]').should("have.value", "");
      cy.get('textarea').eq(0).should("have.value", "{}");
      cy.get('textarea').eq(1).should("have.value", "{}");
    });
  });
  