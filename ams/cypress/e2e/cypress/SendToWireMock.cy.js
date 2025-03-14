describe("Send Scenario to WireMock", () => {
  beforeEach(() => {
    cy.intercept("GET", "/api/scenarios", {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: "Test Scenario",
          mappings: [
            { id: 101, name: "Mapping A" },
            { id: 102, name: "Mapping B" },
          ],
        },
      ],
    }).as("getScenarios");

    cy.intercept("POST", "/api/send-to-wiremock/*", (req) => {
      expect(req.body).to.deep.equal({
        scenarioId: 1,
        mappings: [
          { id: 101, name: "Mapping A" },
          { id: 102, name: "Mapping B" },
        ],
      });
      req.reply({ success: true });
    }).as("sendToWireMock");

    cy.visit("/scenarios");
    cy.wait("@getScenarios");
  });

  it("should send all mappings of the scenario to WireMock when clicking the button", () => {
    // Klicka på "Send to WireMock"-knappen
    cy.contains("Send to WireMock").click();

    // Vänta på API-anropet
    cy.wait("@sendToWireMock").its("response.statusCode").should("eq", 200);

    // Kontrollera att bekräftelsemeddelandet visas
    cy.on("window:alert", (text) => {
      expect(text).to.contains("Scenario sent successfully!");
    });
  });
});
