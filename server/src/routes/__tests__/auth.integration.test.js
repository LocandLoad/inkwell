import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";
beforeEach(async () => {
    await resetDatabase();
});

// Verification note: without this, Jest reports an open handle and waits
// out its own ~10s timeout before exiting, because app.js's import chain
// creates a real PrismaClient connection pool that nothing ever closes.
afterAll(async () => {
    await prisma.$disconnect();
});

test("full flow: register and login", async () => {
    // Arrange + Act (Section 4.6's AAA pattern): register a real user
    const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: "alice1@example.com", displayName: "Alice1", password: "correcthorse" });
    expect(registerRes.status).toBe(201);
    const { user, accessToken } = registerRes.body;
    const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "alice1@example.com", password: "correcthorse" });
    expect(loginRes.status).toBe(200);
    expect(user.id).toBe(loginRes.body.user.id);
    expect(accessToken).toBe(loginRes.body.accessToken);
});