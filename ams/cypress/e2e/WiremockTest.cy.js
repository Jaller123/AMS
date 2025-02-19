/// <reference types="cypress" />

describe("WireMock Mappings Test", () => {
  const apiBaseUrl = "http://localhost:8080";
  const wireMockUrl = "http://localhost:8081/__admin";

  beforeEach(() => {
    cy.request("GET", `${apiBaseUrl}/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.wiremockRunning).to.be.true;
    });
  });

  it("Skapar en ny mapping och validerar i WireMock", () => {
    const newMapping = {
      request: {
        method: "POST",
        url: "/test-endpoint",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          key: "value",
        },
        // Optionally add a title or other fields if your UI uses them
        title: "Test Mapping",
        title: "Test Mapping",
      },
      response: {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          message: "Success",
        },
      },
    };

    // Steg 1: Skapa mapping
    cy.request("POST", `${apiBaseUrl}/mappings`, newMapping).then(
      (postResponse) => {
        expect(postResponse.status).to.eq(200);
        expect(postResponse.body.success).to.be.true;
        const { id, wireMockUuid } = postResponse.body.newRequest;

        // Steg 2: Stub GET /mappings to include our new mapping
        // (This is similar to what you do in your working tests for Traffic)
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
                  body: newMapping.request.body,
                },
                wireMockUuid: wireMockUuid,
              },
            ],
            responses: [],
          },
        }).as("getMappings");

        // Steg 3: Navigera till första sidan med sparade mappningar
        cy.visit("http://localhost:5173/");
        cy.wait("@getMappings");

        // Steg 4: Vänta på och klicka på "Show Details" för att visa den skapade mappningen
        cy.get('[data-testid="mapping-item"]', { timeout: 10000 }).should(
          "exist"
        );
        cy.get('[data-testid="toggle-button"]')
          .first()
          .should("contain", "Show Details")
          .click();

        // Steg 5: Klicka på knappen för att skicka till WireMock
        cy.contains("Send to WireMock").click();

        // Steg 6: Kontrollera att mappningen finns i WireMock
        cy.wait(1000); // Vänta en stund för att säkerställa att mappningen skickades
        cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
          cy.log("Alla mappings från WireMock:", wmResponse.body.mappings);
          expect(wmResponse.status).to.eq(200);
          const mappingExists = wmResponse.body.mappings.some(
            (m) => m.wireMockUuid === wireMockUuid
          );
          expect(mappingExists).to.be.true;
        });

        // Steg 7: Testa om mappingen fungerar
        cy.request({
          method: "POST",
          url: "http://localhost:8081/test-endpoint",
          headers: { "Content-Type": "application/json" },
          body: { key: "value" },
        }).then((testResponse) => {
          expect(testResponse.status).to.eq(200);
          expect(testResponse.body.message).to.eq("Success");
        });
      }
    );
    // Steg 2: Stub GET /mappings to include our new mapping
    // (This is similar to what you do in your working tests for Traffic)
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
              body: newMapping.request.body,
            },
            wireMockUuid: wireMockUuid,
          },
        ],
        responses: [],
      },
    }).as("getMappings");

    // Steg 3: Navigera till första sidan med sparade mappningar
    cy.visit("http://localhost:5173/");
    cy.wait("@getMappings");

    // Steg 4: Vänta på och klicka på "Show Details" för att visa den skapade mappningen
    cy.get('[data-testid="mapping-item"]', { timeout: 10000 }).should("exist");
    cy.get('[data-testid="toggle-button"]')
      .first()
      .should("contain", "Show Details")
      .click();

    // Steg 5: Klicka på knappen för att skicka till WireMock
    cy.contains("Send to WireMock").click();

    // Steg 6: Kontrollera att mappningen finns i WireMock
    cy.wait(1000); // Vänta en stund för att säkerställa att mappningen skickades
    cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
      cy.log("Alla mappings från WireMock:", wmResponse.body.mappings);
      expect(wmResponse.status).to.eq(200);
      const mappingExists = wmResponse.body.mappings.some(
        (m) => m.wireMockUuid === wireMockUuid
      );
      expect(mappingExists).to.be.true;
    });

    // Steg 7: Testa om mappingen fungerar
    cy.request({
      method: "POST",
      url: "http://localhost:8081/test-endpoint",
      headers: { "Content-Type": "application/json" },
      body: { key: "value" },
    }).then((testResponse) => {
      expect(testResponse.status).to.eq(200);
      expect(testResponse.body.message).to.eq("Success");
    });
  });
});

it("Raderar en mapping och verifierar att den är borta från WireMock", () => {
  // Först skapar vi en mapping att ta bort
  const testMapping = {
    request: {
      method: "GET",
      url: "/delete-test",
    },
    response: {
      status: 204,
    },
  };

  cy.request("POST", `${apiBaseUrl}/mappings`, testMapping).then(
    (postResponse) => {
      expect(postResponse.status).to.eq(200);
      const { id, wireMockUuid } = postResponse.body.newRequest;

      // Radera mappningen
      cy.request("DELETE", `${apiBaseUrl}/mappings/${id}`).then(
        (deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
          expect(deleteResponse.body.success).to.be.true;

          // Kontrollera att den försvunnit från WireMock
          cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
            const mappingStillExists = wmResponse.body.mappings.some(
              (m) => m.id === wireMockUuid
            );
            expect(mappingStillExists).to.be.false;
          });
        }
      );
    }
  );
});
