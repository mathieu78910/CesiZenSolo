import { beforeEach, describe, expect, it, vi } from "vitest";

const { authServiceMock } = vi.hoisted(() => ({
  authServiceMock: {
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    refreshTokens: vi.fn(),
    revokeRefreshToken: vi.fn()
  }
}));

vi.mock("../services/auth.service.js", () => authServiceMock);

import { forgotPassword, login, logout, refresh, register } from "./auth.controller.js";

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
}

describe("auth.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register returns 201 with access token and cookie", async () => {
    authServiceMock.registerUser.mockResolvedValueOnce({
      user: { userId: 1, email: "u@test.fr", firstName: "U", lastName: "T", role: "USER" },
      tokens: { accessToken: "acc", refreshToken: "ref" }
    });

    const req: any = { body: { email: "u@test.fr", password: "Password123!", firstName: "U", lastName: "T" }, headers: {}, ip: "127.0.0.1" };
    const res = createRes();
    await register(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("login returns 200", async () => {
    authServiceMock.loginUser.mockResolvedValueOnce({
      user: { userId: 2, email: "a@b.fr", firstName: "A", lastName: "B", role: "USER" },
      tokens: { accessToken: "acc2", refreshToken: "ref2" }
    });

    const req: any = { body: { email: "a@b.fr", password: "Password123!" }, headers: {}, ip: "127.0.0.1" };
    const res = createRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("refresh returns 401 without cookie", async () => {
    const req: any = { cookies: {} };
    const res = createRes();
    await refresh(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("logout clears cookie", async () => {
    const req: any = {};
    const res = createRes();
    await logout(req, res);
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("forgotPassword returns 202 with valid email", async () => {
    const req: any = { body: { email: "test@x.fr" } };
    const res = createRes();
    await forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(202);
  });
});
