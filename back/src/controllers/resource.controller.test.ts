import { beforeEach, describe, expect, it, vi } from "vitest";

const { resourceServiceMock } = vi.hoisted(() => ({
  resourceServiceMock: {
    createResource: vi.fn(),
    deleteResource: vi.fn(),
    getResourceById: vi.fn(),
    listResources: vi.fn(),
    toggleResourceLike: vi.fn(),
    toggleResourceSave: vi.fn(),
    updateResource: vi.fn()
  }
}));

vi.mock("../services/resource.service.js", () => resourceServiceMock);

import {
  createResource,
  deleteResource,
  getResourceById,
  listAppResources,
  listResources,
  toggleResourceLike,
  toggleResourceSave,
  updateResource
} from "./resource.controller.js";

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("resource.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists public resources", async () => {
    resourceServiceMock.listResources.mockResolvedValueOnce({ resources: [], total: 0, page: 1, limit: 20 });
    const req: any = { query: {} };
    const res = createRes();
    await listResources(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("lists app resources with user context", async () => {
    resourceServiceMock.listResources.mockResolvedValueOnce({ resources: [{ resourceId: 1 }], total: 1, page: 1, limit: 20 });
    const req: any = { query: {}, user: { userId: 3 } };
    const res = createRes();
    await listAppResources(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("gets one resource", async () => {
    resourceServiceMock.getResourceById.mockResolvedValueOnce({ resourceId: 10 });
    const req: any = { params: { resourceId: "10" } };
    const res = createRes();
    await getResourceById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("creates resource", async () => {
    resourceServiceMock.createResource.mockResolvedValueOnce({ resourceId: 11 });
    const req: any = {
      body: { title: "Titre", content: "Contenu", resourceType: "ARTICLE", categories: ["stress"] }
    };
    const res = createRes();
    await createResource(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("updates resource", async () => {
    resourceServiceMock.updateResource.mockResolvedValueOnce({ resourceId: 11, title: "Maj" });
    const req: any = { params: { resourceId: "11" }, body: { title: "Maj" } };
    const res = createRes();
    await updateResource(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deletes resource", async () => {
    resourceServiceMock.deleteResource.mockResolvedValueOnce(true);
    const req: any = { params: { resourceId: "11" } };
    const res = createRes();
    await deleteResource(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("toggles like and save", async () => {
    resourceServiceMock.toggleResourceLike.mockResolvedValueOnce({ resourceId: 11, likeCount: 3 });
    resourceServiceMock.toggleResourceSave.mockResolvedValueOnce({ resourceId: 11, saveCount: 2 });
    const resA = createRes();
    const resB = createRes();
    const req: any = { params: { resourceId: "11" }, user: { userId: 4 } };

    await toggleResourceLike(req, resA);
    await toggleResourceSave(req, resB);

    expect(resA.status).toHaveBeenCalledWith(200);
    expect(resB.status).toHaveBeenCalledWith(200);
  });
});

