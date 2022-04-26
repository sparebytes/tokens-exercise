var z: string = "";

import { withServer } from "../test/helper";
import { isValidToken } from "./utils";

const authKey = process.env.API_AUTHENTICATION_SUPER_KEYS?.split(",")[0];
const headers = {
  Authorization: `Bearer ${authKey}`,
};

describe("/tokens", () => {
  test("Invalid URL", () =>
    withServer(async (server) => {
      const res = await server.inject({ headers, method: "GET", url: "/tokens/made-up" });
      expect(res.statusCode).toBe(404);
    }));

  test("No Authorization", () =>
    withServer(async (server) => {
      const res = await server.inject({ method: "GET", url: "/tokens" });
      expect(res.statusCode).toBe(401);
    }));

  describe("GET /tokens", () => {
    test("400 if missing query string", () =>
      withServer(async (server) => {
        const res = await server.inject({ headers, method: "GET", url: "/tokens" });
        expect(res.statusCode).toBe(400);
        expect(res.payload).toBe('{"error":"Query string \\"t\\" must be provided."}');
      }));

    test("400 if empty query string", () =>
      withServer(async (server) => {
        const res = await server.inject({
          headers,
          method: "GET",
          url: "/tokens",
          query: { t: "" },
        });
        expect(res.statusCode).toBe(400);
        expect(res.payload).toBe('{"error":"Query string \\"t\\" must not be empty."}');
      }));
  });

  describe("POST /tokens", () => {
    test("400 if missing secret", () =>
      withServer(async (server) => {
        const res = await server.inject({ headers, method: "POST", url: "/tokens", payload: {} });
        expect(res.statusCode).toBe(400);
        expect(res.payload).toBe('{"error":"Body property \\"secret\\" must be provided."}');
      }));

    test("400 if non-string secret", () =>
      withServer(async (server) => {
        const res = await server.inject({
          headers,
          method: "POST",
          url: "/tokens",
          payload: {
            secret: 123,
          },
        });
        expect(res.statusCode).toBe(400);
        expect(res.payload).toBe('{"error":"Body property \\"secret\\" must be a string."}');
      }));

    test("Empty Secret", () =>
      withServer(async (server) => {
        const res = await server.inject({
          headers,
          method: "POST",
          url: "/tokens",
          payload: {
            secret: "",
          },
        });
        expect(res.statusCode).toBe(200);
        const { token } = JSON.parse(res.payload);
        expect(isValidToken(token)).toBe(true);
      }));

    test("Typical Secret", () =>
      withServer(async (server) => {
        const res = await server.inject({
          headers,
          method: "POST",
          url: "/tokens",
          payload: {
            secret: "ThisIsAnExampleSecret",
          },
        });
        expect(res.statusCode).toBe(200);
        const { token } = JSON.parse(res.payload);
        expect(isValidToken(token)).toBe(true);
      }));
  });

  test("E2E", () =>
    withServer(async (server) => {
      // insert 1
      const res10 = await server.inject({
        headers,
        method: "POST",
        url: "/tokens",
        payload: { secret: "My Secret" },
      });
      expect(res10.statusCode).toBe(200);
      const t1 = JSON.parse(res10.payload).token;

      // insert 2
      const res11 = await server.inject({
        headers,
        method: "POST",
        url: "/tokens",
        payload: { secret: "My Other Secret" },
      });
      expect(res11.statusCode).toBe(200);
      const t2 = JSON.parse(res11.payload).token;

      // get
      const res20 = await server.inject({
        headers,
        method: "GET",
        url: "/tokens",
        query: { t: t1 },
      });
      expect(res20.statusCode).toBe(200);
      expect(JSON.parse(res20.payload)).toMatchObject({ [t1]: "My Secret" });

      // get many
      const res21 = await server.inject({
        headers,
        method: "GET",
        url: "/tokens",
        query: { t: `${t1},${t2}` },
      });
      expect(res21.statusCode).toBe(200);
      expect(JSON.parse(res21.payload)).toMatchObject({
        [t1]: "My Secret",
        [t2]: "My Other Secret",
      });

      // update
      const res30 = await server.inject({
        headers,
        method: "PUT",
        url: `/tokens/${t1}`,
        payload: { secret: "New Secret" },
      });
      expect(res30.statusCode).toBe(200);
      expect(JSON.parse(res30.payload)).toMatchObject({ token: t1 });

      // get
      const res40 = await server.inject({
        headers,
        method: "GET",
        url: "/tokens",
        query: { t: t1 },
      });
      expect(res40.statusCode).toBe(200);
      expect(JSON.parse(res40.payload)).toMatchObject({ [t1]: "New Secret" });

      // delete
      const res50 = await server.inject({ headers, method: "DELETE", url: `/tokens/${t1}` });
      expect(res50.statusCode).toBe(204);
      expect(res50.payload).toBe("null");
    }));
});
