/// <reference types="cypress" />

describe("WireMock Mappings Test", () => {
  // Define constants so they are in scope in all tests.
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
        },
        title: "Test Mapping"
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

    // Step 1: Create mapping via POST /mappings
    cy.request("POST", `${apiBaseUrl}/mappings`, newMapping).then((postResponse) => {
      expect(postResponse.status).to.eq(200);
      expect(postResponse.body.success).to.be.true;
      const { id } = postResponse.body.newRequest;

      // Stub GET /mappings so the UI receives our new mapping
      cy.intercept("GET", "**/mappings", {
        statusCode: 200,
        body: {
          requests: [
            {
              id: id,
              resJson: {
                title: newMapping.request.title || "Mapping",
                url: newMapping.request.url,
                method: newMapping.request.method,
                headers: newMapping.request.headers,
                body: newMapping.request.body
              },
              // Initially, the mapping doesn't have a WireMock ID
              wireMockUuid: null
            }
          ],
          responses: []
        }
      }).as("getMappings");

      // Visit the homepage and wait for stubbed mappings
      cy.visit("http://localhost:5173/");
      cy.wait("@getMappings");

      // Expand the created mapping details
      cy.get('[data-testid="mapping-item"]', { timeout: 10000 }).should("exist");
      cy.get('[data-testid="toggle-button"]')
        .first()
        .should("contain", "Show Details")
        .click();

      // Intercept the send-to-WireMock call so we can capture its returned ID
      cy.intercept("POST", `${apiBaseUrl}/mappings/*/send`).as("sendMapping");

      // Click the "Send to WireMock" button
      cy.contains("Send to WireMock").click();

      // Wait for the send call and capture the WireMock ID from the response
      cy.wait("@sendMapping").then(({ response }) => {
        const wireMockId = response.body.wireMockIdd;
        expect(wireMockId, "WireMock ID should exist").to.exist;

        // Step 6: Verify the mapping exists in WireMock using the returned ID
        cy.wait(1000); // Allow time for WireMock to register the mapping
        cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
          cy.log("Alla mappings från WireMock:", wmResponse.body.mappings);
          expect(wmResponse.status).to.eq(200);
          const mappingExists = wmResponse.body.mappings.some(
            (m) => m.id === wireMockId
          );
          expect(mappingExists, "Mapping should exist in WireMock").to.be.true;
        });

        // Step 7: Test the mapping by sending a POST request to /test-endpoint
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

    // Create a mapping to delete
    cy.request("POST", `${apiBaseUrl}/mappings`, testMapping).then((postResponse) => {
      expect(postResponse.status).to.eq(200);
      const { id } = postResponse.body.newRequest;

      // Send the mapping to WireMock first
      cy.request("POST", `${apiBaseUrl}/mappings/${id}/send`).then((sendResponse) => {
        expect(sendResponse.status).to.eq(200);
        const wireMockId = sendResponse.body.wireMockIdd;
        expect(wireMockId, "WireMock ID from send should exist").to.exist;

        // Now delete the mapping
        cy.request("DELETE", `${apiBaseUrl}/mappings/${id}`).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
          expect(deleteResponse.body.success).to.be.true;

          // Verify that the mapping no longer exists in WireMock
          cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
            const mappingStillExists = wmResponse.body.mappings.some(
              (m) => m.id === wireMockId
            );
            expect(mappingStillExists, "Mapping should be removed from WireMock").to.be.false;
          });
        });
      });
    });
  });
});
