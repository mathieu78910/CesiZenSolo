import { beforeEach, describe, expect, it, vi } from "vitest";

const { userServiceMock, resourceServiceMock } = vi.hoisted(() => ({
  userServiceMock: {
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    getUserById: vi.fn(),
    listUsers: vi.fn(),
    updateUser: vi.fn()
  },
  resourceServiceMock: {
    listUserResourceLibrary: vi.fn()
  }
}));

vi.mock("../services/user.service.js", () => userServiceMock);
vi.mock("../services/resource.service.js", () => ({
  listUserResourceLibrary: resourceServiceMock.listUserResourceLibrary
}));

import {
  createUser,
  deleteUser,
  getCurrentUser,
  getCurrentUserLibrary,
  getUserById,
  listUsers,
  updateCurrentUser,
  updateUser
} from "./user.controller.js";

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("user.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists users", async () => {
    userServiceMock.listUsers.mockResolvedValueOnce({ users: [{ userId: 1 }], total: 1, page: 1, limit: 20 });
    const req: any = { query: {} };
    const res = createRes();
    await listUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("creates user", async () => {
    userServiceMock.createUser.mockResolvedValueOnce({ userId: 2, email: "a@b.fr" });
    const req: any = {
      body: { firstName: "A", lastName: "B", email: "a@b.fr", password: "Password123!", role: "USER" }
    };
    const res = createRes();
    await createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("gets current user", async () => {
    userServiceMock.getUserById.mockResolvedValueOnce({ userId: 5, email: "u@test.fr" });
    const req: any = { user: { userId: 5 } };
    const res = createRes();
    await getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("gets user by id", async () => {
    userServiceMock.getUserById.mockResolvedValueOnce({ userId: 7 });
    const req: any = { params: { userId: "7" } };
    const res = createRes();
    await getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates current user", async () => {
    userServiceMock.updateUser.mockResolvedValueOnce({ userId: 5, firstName: "Updated" });
    const req: any = { user: { userId: 5 }, body: { firstName: "Updated" }, params: {} };
    const res = createRes();
    await updateCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updates user by id", async () => {
    userServiceMock.updateUser.mockResolvedValueOnce({ userId: 8, firstName: "AdminEdit" });
    const req: any = { params: { userId: "8" }, body: { firstName: "AdminEdit" } };
    const res = createRes();
    await updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deletes user", async () => {
    userServiceMock.deleteUser.mockResolvedValueOnce(true);
    const req: any = { params: { userId: "9" } };
    const res = createRes();
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("returns current user library", async () => {
    resourceServiceMock.listUserResourceLibrary.mockResolvedValueOnce({
      likedResources: [{ resourceId: 1 }],
      savedResources: [{ resourceId: 2 }]
    });
    const req: any = { user: { userId: 5 } };
    const res = createRes();
    await getCurrentUserLibrary(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
