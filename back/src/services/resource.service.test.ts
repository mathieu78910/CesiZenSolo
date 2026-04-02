import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    resource: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn()
    },
    userResourceLike: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn()
    },
    userSavedResource: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn()
    }
  }
}));

vi.mock("../utils/prisma.js", () => ({
  prisma: prismaMock
}));

import {
  createResource,
  deleteResource,
  getResourceById,
  listResources,
  toggleResourceLike,
  toggleResourceSave,
  updateResource
} from "./resource.service.js";

function mockResource(overrides: Record<string, unknown> = {}) {
  return {
    resourceId: 10,
    title: "Respiration trail",
    content: "<p>Contenu</p>",
    resourceType: "ARTICLE",
    categories: [{ category: { categoryId: 1, label: "stress" } }],
    _count: { likes: 3, saves: 2 },
    likes: [],
    saves: [],
    ...overrides
  };
}

describe("resource.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a resource and normalizes categories", async () => {
    prismaMock.resource.create.mockResolvedValueOnce(mockResource());

    const result = await createResource({
      title: "  Respiration trail  ",
      content: "  Contenu utile ",
      resourceType: " ARTICLE ",
      categories: ["stress", "stress", " sommeil "]
    });

    expect(prismaMock.resource.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Respiration trail",
          content: "Contenu utile",
          resourceType: "ARTICLE",
          categories: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                category: expect.objectContaining({
                  connectOrCreate: expect.objectContaining({
                    where: { label: "stress" }
                  })
                })
              }),
              expect.objectContaining({
                category: expect.objectContaining({
                  connectOrCreate: expect.objectContaining({
                    where: { label: "sommeil" }
                  })
                })
              })
            ])
          })
        })
      })
    );
    expect(result.resourceId).toBe(10);
    expect(result.saveCount).toBe(2);
  });

  it("updates a resource", async () => {
    prismaMock.resource.findUnique.mockResolvedValueOnce({ resourceId: 10 });
    prismaMock.resource.update.mockResolvedValueOnce(mockResource({ title: "Nouveau titre" }));

    const updated = await updateResource(10, {
      title: " Nouveau titre ",
      categories: ["focus"]
    });

    expect(prismaMock.resource.update).toHaveBeenCalled();
    expect(updated.title).toBe("Nouveau titre");
  });

  it("deletes an existing resource", async () => {
    prismaMock.resource.findUnique.mockResolvedValueOnce({ resourceId: 10 });
    prismaMock.resource.delete.mockResolvedValueOnce({});

    const result = await deleteResource(10);

    expect(result).toBe(true);
    expect(prismaMock.resource.delete).toHaveBeenCalledWith({ where: { resourceId: 10 } });
  });

  it("toggles save on resource", async () => {
    prismaMock.resource.findUnique.mockResolvedValueOnce({ resourceId: 10 });
    prismaMock.userSavedResource.findUnique.mockResolvedValueOnce(null);
    prismaMock.userSavedResource.create.mockResolvedValueOnce({});
    prismaMock.resource.findUnique.mockResolvedValueOnce(
      mockResource({
        saves: [{ userId: 44 }],
        _count: { likes: 3, saves: 3 }
      })
    );

    const result = await toggleResourceSave(10, 44);

    expect(prismaMock.userSavedResource.create).toHaveBeenCalledWith({
      data: { userId: 44, resourceId: 10 }
    });
    expect(result.savedByCurrentUser).toBe(true);
    expect(result.saveCount).toBe(3);
  });

  it("toggles like on resource", async () => {
    prismaMock.resource.findUnique.mockResolvedValueOnce({ resourceId: 10 });
    prismaMock.userResourceLike.findUnique.mockResolvedValueOnce(null);
    prismaMock.userResourceLike.create.mockResolvedValueOnce({});
    prismaMock.resource.findUnique.mockResolvedValueOnce(
      mockResource({
        likes: [{ userId: 44 }],
        _count: { likes: 4, saves: 2 }
      })
    );

    const result = await toggleResourceLike(10, 44);

    expect(prismaMock.userResourceLike.create).toHaveBeenCalledWith({
      data: { userId: 44, resourceId: 10 }
    });
    expect(result.likedByCurrentUser).toBe(true);
    expect(result.likeCount).toBe(4);
  });

  it("lists resources with pagination", async () => {
    prismaMock.resource.findMany.mockResolvedValueOnce([mockResource({ resourceId: 10 }), mockResource({ resourceId: 11 })]);
    prismaMock.resource.count.mockResolvedValueOnce(2);

    const result = await listResources({ page: 1, limit: 2, search: "respiration", resourceType: "ARTICLE" });

    expect(result.total).toBe(2);
    expect(result.resources).toHaveLength(2);
  });

  it("gets one resource by id", async () => {
    prismaMock.resource.findUnique.mockResolvedValueOnce(mockResource({ resourceId: 77 }));

    const result = await getResourceById(77);

    expect(result.resourceId).toBe(77);
  });
});
