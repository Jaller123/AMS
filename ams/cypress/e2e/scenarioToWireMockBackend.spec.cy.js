describe("Send Scenario to WireMock via Backend", () => {
  // Register the before hook at the suite level.
  before(() => {
    const scenariosContent = [
      {
        "id": "1",
        "name": "ScenarioTest",
        "mappings": [
          {
            "request": {
              "reqId": "1"
            },
            "response": {},
          },
          {
            "request": {
              "reqId": "2"
            },
            "response": {},
            "wireMockId": "1a58c20f-197b-458b-bcd6-c8e36b223659"
          },
          {
            "request": {
              "reqId": "3"
            },
            "response": {},
            "wireMockId": "6d64592c-60ba-47f7-9331-f492ea06393a"
          }
        ]
      }
    ];
    cy.writeFile("src/backend/scenarios.json", JSON.stringify(scenariosContent, null, 2));

    const mappingRequestsContent = [
      {
        "id": "1",
        "resJson": {
          "title": "Mapping 1",
          "url": "/ett",
          "method": "GET",
          "headers": {
            "Content-Type": {
              "equalTo": "application/json"
            }
          },
          "bodyPatterns": [
            {
              "equalToJson": {
                "body": "text"
              }
            }
          ]
        },
        "wireMockId": "ffd8f7ae-30d5-4e11-9832-844482717040"
      },
      {
        "id": "2",
        "resJson": {
          "title": "Mapping 2",
          "url": "/tva",
          "method": "GET",
          "headers": {
            "Content-Type": {
              "equalTo": "application/json"
            }
          },
          "bodyPatterns": [
            {
              "equalToJson": {
                "body": "text"
              }
            }
          ]
        },
        "wireMockId": "1a58c20f-197b-458b-bcd6-c8e36b223659"
      },
      {
        "id": "3",
        "resJson": {
          "title": "Mapping 3",
          "url": "/tre",
          "method": "GET",
          "headers": {
            "Content-Type": {
              "equalTo": "application/json"
            }
          },
          "bodyPatterns": [
            {
              "equalToJson": {
                "body": "text"
              }
            }
          ]
        },
        "wireMockId": "6d64592c-60ba-47f7-9331-f492ea06393a"
      }
    ];
    cy.writeFile("src/backend/mappings_requests.json", JSON.stringify(mappingRequestsContent, null, 2));

    const mappingsResponsesContent = [
      {
        "id": "1.1",
        "reqId": "1",
        "resJson": {
          "status": "200",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "body": "text"
          }
        },
        "timestamp": "2025-03-14 15:10:12"
      },
      {
        "id": "2.1",
        "reqId": "2",
        "resJson": {
          "status": "200",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "body": "text"
          }
        },
        "timestamp": "2025-03-14 15:10:57"
      },
      {
        "id": "3.1",
        "reqId": "3",
        "resJson": {
          "status": "200",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "body": "text"
          }
        },
        "timestamp": "2025-03-14 15:11:30"
      }
    ];
    cy.writeFile("src/backend/mappings_responses.json", JSON.stringify(mappingsResponsesContent, null, 2));
  });

  it("Should add temporary JSON files, and verify mappings exist in WireMock", () => {
    // Wait a few seconds for the mappings to be processed and JSON files to be updated.
    cy.wait(3000);

    // Verify that scenarios.json has the expected scenario and mappings.
    cy.readFile("src/backend/scenarios.json").then((scenarios) => {
      const scenario = scenarios.find((s) => s.name === "ScenarioTest");
      expect(scenario, "ScenarioTest exists in scenarios.json").to.exist;
      scenario.mappings.forEach((mapping) => {
        expect(mapping.wireMockId, `Mapping with reqId ${mapping.request.reqId} has wireMockId`).to.exist;
      });
    });

    // Verify that each mapping exists in WireMock.
    cy.request("GET", "http://localhost:8081/__admin/mappings").then((response) => {
      expect(response.status).to.eq(200);
      const wmMappings = response.body.mappings;
      cy.readFile("src/backend/scenarios.json").then((scenarios) => {
        const scenario = scenarios.find((s) => s.name === "ScenarioTest");
        scenario.mappings.forEach((mapping) => {
          const existsInWireMock = wmMappings.some(
            (wmMapping) => wmMapping.request.url === mapping.url
          );
          expect(
            existsInWireMock,
            `Mapping with reqId ${mapping.request.url} (: ${mapping.url}) exists in WireMock`
          ).to.be.true;
        });
      });
    });
  });

  // Clean up by deleting the temporary files.
  after(() => {
    cy.exec("rm src/backend/scenarios.json");
    cy.exec("rm src/backend/mappings_requests.json");
    cy.exec("rm src/backend/mappings_responses.json");
  });
});
