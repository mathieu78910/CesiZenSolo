import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  },
  bcryptMock: {
    hash: vi.fn()
  }
}));

vi.mock("../utils/prisma.js", () => ({
  prisma: prismaMock
}));

vi.mock("bcrypt", () => ({
  default: bcryptMock
}));

import { createUser, deleteUser, listUsers, updateUser } from "./user.service.js";

describe("user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptMock.hash.mockResolvedValue("hashed-value");
  });

  it("creates a user with lowercased email", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      userId: 12,
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@test.fr",
      role: "USER",
      isAnonymized: false
    });

    const user = await createUser({
      firstName: "Jean",
      lastName: "Dupont",
      email: "Jean@Test.FR",
      password: "Password123!"
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "jean@test.fr" },
      select: { userId: true }
    });
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(user.email).toBe("jean@test.fr");
  });

  it("rejects create when email is already in use", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ userId: 1 });

    await expect(
      createUser({
        firstName: "A",
        lastName: "B",
        email: "a@b.fr",
        password: "Password123!"
      })
    ).rejects.toThrow("EMAIL_IN_USE");
  });

  it("anonymizes user on delete", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      userId: 22,
      role: "USER",
      isAnonymized: false
    });
    prismaMock.user.update.mockResolvedValueOnce({ userId: 22 });

    const result = await deleteUser(22);

    expect(result).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 22 },
        data: expect.objectContaining({
          firstName: "Utilisateur",
          role: "USER",
          isAnonymized: true
        })
      })
    );
  });

  it("updates email in lowercase", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ userId: 5, isAnonymized: false });
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.update.mockResolvedValueOnce({
      userId: 5,
      firstName: "Neo",
      lastName: "Test",
      email: "neo@test.fr",
      role: "USER",
      isAnonymized: false
    });

    const user = await updateUser(5, { email: "Neo@Test.FR" });

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 5 },
        data: expect.objectContaining({
          email: "neo@test.fr"
        })
      })
    );
    expect(user.email).toBe("neo@test.fr");
  });

  it("returns paginated users", async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([{ userId: 1 }, { userId: 2 }]);
    prismaMock.user.count.mockResolvedValueOnce(2);

    const response = await listUsers({ page: 1, limit: 2, search: "jo" });

    expect(response.total).toBe(2);
    expect(response.users).toHaveLength(2);
    expect(prismaMock.user.findMany).toHaveBeenCalled();
  });
});
