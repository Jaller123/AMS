/// <reference types="cypress" />

describe("WireMock Mappings Test", () => {
  // Define constants at the top so they are in scope in all tests.
  const apiBaseUrl = "http://localhost:8080";
  const wireMockUrl = "http://localhost:8081/__admin";

  beforeEach(() => {
    // Check that the health endpoint returns OK
    cy.request({
      method: "GET",
      url: `${apiBaseUrl}/health`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.wiremockRunning).to.be.true;
    });
  });

  it("Hämtar befintliga mappningar", () => {
    cy.request({
      method: "GET",
      url: `${apiBaseUrl}/mappings`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("requests");
      expect(response.body).to.have.property("responses");
    });
  });

  it("Skapar en ny mapping och validerar i WireMock", () => {
    const newMapping = {
      request: {
        method: "POST",
        url: "/test-endpoint",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          key: "value"
        }
        // Optionally, add more fields (like title) if needed.
      },
      response: {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          message: "Success"
        }
      }
    };

    // Step 1: Create a new mapping via POST /mappings
    cy.request("POST", `${apiBaseUrl}/mappings`, newMapping).then((postResponse) => {
      expect(postResponse.status).to.eq(200);
      expect(postResponse.body.success).to.be.true;
      // Destructure the id and wireMockUuid from the response
      const { id, wireMockUuid } = postResponse.body.newRequest;

      // Step 2: Stub the GET /mappings request so the UI receives our new mapping
      cy.intercept("GET", "**/mappings", {
        statusCode: 200,
        body: {
          requests: [
            {
              id: id,
              resJson: {
                // If you add a title in newMapping.request, it would be used here;
                // otherwise, a default value ("Mapping") is provided.
                title: newMapping.request.title || "Mapping",
                url: newMapping.request.url,
                method: newMapping.request.method,
                headers: newMapping.request.headers,
                body: newMapping.request.body
              },
              wireMockUuid: wireMockUuid
            }
          ],
          responses: []
        }
      }).as("getMappings");

      // Step 3: Visit the homepage (assuming it renders the mappings)
      cy.visit("http://localhost:5173/");
      cy.wait("@getMappings");

      // Interact with the UI (e.g., click the "Show Details" toggle button)
      cy.get('[data-testid="mapping-item"]', { timeout: 10000 }).should("exist");
      cy.get('[data-testid="toggle-button"]')
        .first()
        .should("contain", "Show Details")
        .click();

      // Click on the "Send to WireMock" button
      cy.contains("Send to WireMock").click();

      // Step 4: Check that the mapping exists in WireMock
      cy.wait(1000);
      cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
        expect(wmResponse.status).to.eq(200);
        const mappingExists = wmResponse.body.mappings.some(
          (m) => m.wireMockUuid === wireMockUuid
        );
        expect(mappingExists).to.be.true;
      });

      // Step 5: Test the mapping by sending a POST request to the endpoint through WireMock
      cy.request({
        method: "POST",
        url: "http://localhost:8081/test-endpoint",
        headers: { "Content-Type": "application/json" },
        body: { key: "value" }
      }).then((testResponse) => {
        expect(testResponse.status).to.eq(200);
        expect(testResponse.body.message).to.eq("Success");
      });
    });
  });

  it("Raderar en mapping och verifierar att den är borta från WireMock", () => {
    const testMapping = {
      request: {
        method: "GET",
        url: "/delete-test"
      },
      response: {
        status: 204
      }
    };

    // Create a mapping that we will delete later.
    cy.request("POST", `${apiBaseUrl}/mappings`, testMapping).then((postResponse) => {
      expect(postResponse.status).to.eq(200);
      const { id, wireMockUuid } = postResponse.body.newRequest;

      // Delete the mapping.
      cy.request("DELETE", `${apiBaseUrl}/mappings/${id}`).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(200);
        expect(deleteResponse.body.success).to.be.true;

        // Verify that the mapping is no longer present in WireMock.
        cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
          const mappingStillExists = wmResponse.body.mappings.some(
            (m) => m.id === wireMockUuid
          );
          expect(mappingStillExists).to.be.false;
        });
      });
    });
  });
});
