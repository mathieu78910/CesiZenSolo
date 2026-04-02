import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { authenticateJWT, requireRole } from "./auth.middleware.js";

function mockReq(headers: Record<string, string> = {}, user?: any) {
  return { headers, user } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  } as unknown as Response;
  return res;
}

describe("auth.middleware", () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = "test-access-secret";
  });

  it("authenticates valid bearer token", () => {
    const token = jwt.sign({ sub: 5, role: "USER", email: "u@test.fr" }, process.env.JWT_ACCESS_SECRET as string);
    const req = mockReq({ authorization: `Bearer ${token}` });
    const res = mockRes();
    const next = vi.fn();

    authenticateJWT(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user.userId).toBe(5);
  });

  it("rejects missing token", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    authenticateJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireRole rejects wrong role", () => {
    const req = mockReq({}, { userId: 1, role: "USER" });
    const res = mockRes();
    const next = vi.fn();

    requireRole("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

