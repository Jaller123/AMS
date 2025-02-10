describe("WireMock Mappings Test", () => {
  const apiBaseUrl = "http://localhost:8080";
  const wireMockUrl = "http://localhost:8081/__admin";

  beforeEach(() => {
    cy.request("GET", `${apiBaseUrl}/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.wiremockRunning).to.be.true;
    });
  });

  it("Hämtar befintliga mappningar", () => {
    cy.request("GET", `${apiBaseUrl}/mappings`).then((response) => {
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
          "Content-Type": "application/json",
        },
        body: {
          key: "value",
        },
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

        // Steg 2: Kontrollera att mapping finns i WireMock
        cy.wait(1000);
        cy.log("WireMock UUID från POST:", wireMockUuid);
        cy.request("GET", `${wireMockUrl}/mappings`).then((wmResponse) => {
          cy.log("Alla mappings från WireMock:", wmResponse.body.mappings);
          expect(wmResponse.status).to.eq(200);
          const mappingExists = wmResponse.body.mappings.some(
            (m) => m.wireMockUuid === wireMockUuid
          );
          expect(mappingExists).to.be.true;
        });

        // Steg 3: Testa om mappingen fungerar
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
});
