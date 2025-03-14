// cypress/integration/scenarioToWireMock.spec.js

describe('Scenario to WireMock Integration Test', () => {
  it('creates a scenario, sends its mappings to WireMock, and verifies them', () => {
    const testScenario = {
      scenario: {
        name: "Test Scenario",
        mappings: [
          {
            request: {
              reqId: "mapping1",
              url: "/user",
              method: "GET",
              headers: { "Content-Type": "application/json" },
              body: { body: "hello" }
            },
            response: {
              resId: "response1",
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: { body: "hello" }
            }
          },
          {
            request: {
              reqId: "mapping2",
              url: "/title",
              method: "GET",
              headers: { "Content-Type": "application/json" },
              body: { body: "req" }
            },
            response: {
              resId: "response2",
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: { body: "res" }
            }
          }
        ]
      }
    };

    // Step 1: Create a new scenario using the fully qualified URL.
    cy.request({
      method: 'POST',
      url: 'http://localhost:8080/scenarios',
      headers: { 'Content-Type': 'application/json' },
      body: testScenario
    })
      .its('body')
      .then((createBody) => {
        const createdScenario = createBody.scenario;
        expect(createdScenario).to.have.property('id');
        expect(createdScenario.mappings).to.have.length(2);

        // Step 2: Send the scenario to WireMock.
        return cy.request({
          method: 'POST',
          url: `http://localhost:8080/scenarios/${createdScenario.id}/send`
        }).then((sendResponse) => {
          expect(sendResponse.status).to.eq(200);
          expect(sendResponse.body.success).to.be.true;

          // Verify that each mapping in the created scenario has a WireMock ID.
          createdScenario.mappings.forEach((mapping) => {
            expect(mapping.wireMockId, 'Mapping has a wireMockId').to.exist;
          });

          // Step 3: Fetch the mappings directly from the WireMock API.
          return cy.request({
            method: 'GET',
            url: 'http://localhost:8081/__admin/mappings'
          }).then((wmResponse) => {
            expect(wmResponse.status).to.eq(200);
            const wireMockMappings = wmResponse.body.mappings;
            // Check that each mapping from the scenario exists in WireMock.
            createdScenario.mappings.forEach((mapping) => {
              const existsInWireMock = wireMockMappings.some(
                (wmMapping) => wmMapping.id === mapping.wireMockId
              );
              expect(existsInWireMock, `Mapping ${mapping.request.reqId} exists in WireMock`).to.be.true;
            });
          });
        });
      });
  });
});
