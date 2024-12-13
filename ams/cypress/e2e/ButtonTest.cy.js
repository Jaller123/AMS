describe("Button test", () => {
  it("should work", () => {
    cy.visit("http://localhost:5173/");
    cy.get("button").should("contain", "Send Mapping").should("be.visible");
    cy.get("button").should("contain", "Send Mapping").click();
  });
});
