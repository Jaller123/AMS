describe("Mapping Management", () => {
  const baseUrl = "http://localhost:8080";

  it("Save current mapping X with unique request", () => {
    // Define a unique request
    const uniqueRequest = {
      url: `/test-${Date.now()}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        key: "value",
      },
    };

    const uniqueResponse = {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        message: "Success",
      },
    };

    // Step 1: Navigate to the Create Mapping page
    cy.visit("/mappings"); // Adjust URL to your frontend mapping page

    // Step 2: Enter a new mapping X
    cy.get('[data-testid="request-url"]').type(uniqueRequest.url); // Replace with actual selectors
    cy.get('[data-testid="request-method"]').select(uniqueRequest.method);
    cy.get('[data-testid="request-headers"]').type(
      JSON.stringify(uniqueRequest.headers)
    );
    cy.get('[data-testid="request-body"]').type(
      JSON.stringify(uniqueRequest.body)
    );

    cy.get('[data-testid="response-status"]').type(uniqueResponse.status);
    cy.get('[data-testid="response-headers"]').type(
      JSON.stringify(uniqueResponse.headers)
    );
    cy.get('[data-testid="response-body"]').type(
      JSON.stringify(uniqueResponse.body)
    );

    // Step 3: Save the mapping
    cy.get('[data-testid="save-mapping"]').click();

    // Step 4: Verify the mapping is saved to the requests.json
    cy.request(`${baseUrl}/mappings`).then((response) => {
      expect(response.status).to.eq(200);
      const requests = response.body.requests;
      const responses = response.body.responses;

      // Check if the request exists in requests.json
      const savedRequest = requests.find(
        (req) => req.resJson.url === uniqueRequest.url
      );
      expect(savedRequest).to.exist;

      // Check if the response exists in responses.json
      const savedResponse = responses.find(
        (res) => res.reqId === savedRequest.id
      );
      expect(savedResponse).to.exist;
      expect(savedResponse.resJson.body).to.deep.equal(uniqueResponse.body);
    });

    // Optional: Add assertions for UI if needed
    cy.contains("Mapping saved successfully").should("be.visible");
  });
});
