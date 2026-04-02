import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock, jwtUtilsMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  },
  bcryptMock: {
    hash: vi.fn(),
    compare: vi.fn()
  },
  jwtUtilsMock: {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn()
  }
}));

vi.mock("../utils/prisma.js", () => ({ prisma: prismaMock }));
vi.mock("bcrypt", () => ({ default: bcryptMock }));
vi.mock("../utils/jwt.js", () => jwtUtilsMock);

import { loginUser, refreshTokens, registerUser } from "./auth.service.js";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptMock.hash.mockResolvedValue("hashed");
    jwtUtilsMock.signAccessToken.mockReturnValue("access-token");
    jwtUtilsMock.signRefreshToken.mockReturnValue("refresh-token");
  });

  it("registers a user", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      userId: 1,
      email: "test@user.fr",
      firstName: "Test",
      lastName: "User",
      role: "USER",
      isAnonymized: false
    });

    const result = await registerUser({
      email: "Test@User.fr",
      password: "Password123!",
      firstName: "Test",
      lastName: "User"
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@user.fr" } });
    expect(result.tokens.accessToken).toBe("access-token");
    expect(result.tokens.refreshToken).toBe("refresh-token");
  });

  it("logs in user with valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      userId: 3,
      email: "a@b.fr",
      firstName: "A",
      lastName: "B",
      role: "USER",
      isAnonymized: false,
      passwordHash: "hashed-db"
    });
    bcryptMock.compare.mockResolvedValueOnce(true);

    const result = await loginUser({ email: "A@B.fr", password: "Password123!" });

    expect(result.user.userId).toBe(3);
    expect(result.tokens.accessToken).toBe("access-token");
  });

  it("refreshes tokens with valid refresh token", async () => {
    jwtUtilsMock.verifyRefreshToken.mockReturnValueOnce({ sub: 9, role: "USER", email: "u@test.fr", typ: "refresh" });
    prismaMock.user.findUnique.mockResolvedValueOnce({
      userId: 9,
      email: "u@test.fr",
      firstName: "U",
      lastName: "T",
      role: "USER",
      isAnonymized: false
    });

    const result = await refreshTokens("refresh-token");
    expect(result.user.userId).toBe(9);
    expect(result.tokens.refreshToken).toBe("refresh-token");
  });
});

