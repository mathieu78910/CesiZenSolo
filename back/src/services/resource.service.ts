import { prisma } from "../utils/prisma.js";
import type { CreateResourceInput, UpdateResourceInput } from "../validators/resource.validator.js";

function normalizeCategoryLabels(categories?: string[]): string[] {
  if (!categories) {
    return [];
  }

  return [...new Set(categories.map((label) => label.trim()).filter(Boolean))];
}

function buildCategoryRelations(labels: string[]) {
  return labels.map((label) => ({
    category: {
      connectOrCreate: {
        where: { label },
        create: { label }
      }
    }
  }));
}

function getResourceInclude(currentUserId?: number) {
  return {
    categories: {
      select: {
        category: {
          select: {
            categoryId: true,
            label: true
          }
        }
      }
    },
    _count: {
      select: {
        likes: true,
        saves: true
      }
    },
    ...(currentUserId
      ? {
          likes: {
            where: { userId: currentUserId },
            select: { userId: true }
          },
          saves: {
            where: { userId: currentUserId },
            select: { userId: true }
          }
        }
      : {})
  } as any;
}

function mapResource(resource: any) {
  return {
    resourceId: resource.resourceId,
    title: resource.title,
    content: resource.content,
    resourceType: resource.resourceType,
    categories: resource.categories.map((item: any) => item.category),
    likeCount: resource._count?.likes ?? 0,
    saveCount: resource._count?.saves ?? 0,
    likedByCurrentUser: Array.isArray(resource.likes) ? resource.likes.length > 0 : false,
    savedByCurrentUser: Array.isArray(resource.saves) ? resource.saves.length > 0 : false
  };
}

export const listResources = async (
  input?: { page?: number; limit?: number; search?: string; resourceType?: string },
  options?: { currentUserId?: number }
) => {
  const page = input?.page ?? 1;
  const limit = input?.limit ?? 20;
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 || limit > 100 ? 20 : limit;
  const skip = (safePage - 1) * safeLimit;

  const search = input?.search?.trim();
  const resourceType = input?.resourceType?.trim();

  const where: any = {
    ...(resourceType ? { resourceType } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
            { categories: { some: { category: { label: { contains: search, mode: "insensitive" } } } } }
          ]
        }
      : {})
  };

  const include = getResourceInclude(options?.currentUserId);
  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { resourceId: "desc" },
      include
    }),
    prisma.resource.count({ where })
  ]);

  return {
    resources: resources.map(mapResource),
    total,
    page: safePage,
    limit: safeLimit
  };
};

export const getResourceById = async (resourceId: number, options?: { currentUserId?: number }) => {
  const resource = await prisma.resource.findUnique({
    where: { resourceId },
    include: getResourceInclude(options?.currentUserId)
  });

  if (!resource) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  return mapResource(resource);
};

export const createResource = async (input: CreateResourceInput) => {
  const labels = normalizeCategoryLabels(input.categories);

  const resource = await prisma.resource.create({
    data: {
      title: input.title.trim(),
      content: input.content.trim(),
      resourceType: input.resourceType.trim(),
      categories: labels.length
        ? {
            create: buildCategoryRelations(labels)
          }
        : undefined
    },
    include: getResourceInclude()
  });

  return mapResource(resource);
};

export const updateResource = async (resourceId: number, input: UpdateResourceInput) => {
  const existing = await prisma.resource.findUnique({
    where: { resourceId },
    select: { resourceId: true }
  });

  if (!existing) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  const labels = input.categories ? normalizeCategoryLabels(input.categories) : undefined;

  const resource = await prisma.resource.update({
    where: { resourceId },
    data: {
      ...(input.title ? { title: input.title.trim() } : {}),
      ...(input.content ? { content: input.content.trim() } : {}),
      ...(input.resourceType ? { resourceType: input.resourceType.trim() } : {}),
      ...(labels
        ? {
            categories: {
              deleteMany: {},
              ...(labels.length ? { create: buildCategoryRelations(labels) } : {})
            }
          }
        : {})
    },
    include: getResourceInclude()
  });

  return mapResource(resource);
};

export const deleteResource = async (resourceId: number) => {
  const existing = await prisma.resource.findUnique({
    where: { resourceId },
    select: { resourceId: true }
  });

  if (!existing) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  await prisma.resource.delete({ where: { resourceId } });
  return true;
};

export const toggleResourceLike = async (resourceId: number, userId: number) => {
  const existingResource = await prisma.resource.findUnique({
    where: { resourceId },
    select: { resourceId: true }
  });

  if (!existingResource) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  const existingLike = await (prisma as any).userResourceLike.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId
      }
    },
    select: { userId: true }
  });

  if (existingLike) {
    await (prisma as any).userResourceLike.delete({
      where: {
        userId_resourceId: {
          userId,
          resourceId
        }
      }
    });
  } else {
    await (prisma as any).userResourceLike.create({
      data: {
        userId,
        resourceId
      }
    });
  }

  return getResourceById(resourceId, { currentUserId: userId });
};

export const toggleResourceSave = async (resourceId: number, userId: number) => {
  const existingResource = await prisma.resource.findUnique({
    where: { resourceId },
    select: { resourceId: true }
  });

  if (!existingResource) {
    throw new Error("RESOURCE_NOT_FOUND");
  }

  const existingSave = await (prisma as any).userSavedResource.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId
      }
    },
    select: { userId: true }
  });

  if (existingSave) {
    await (prisma as any).userSavedResource.delete({
      where: {
        userId_resourceId: {
          userId,
          resourceId
        }
      }
    });
  } else {
    await (prisma as any).userSavedResource.create({
      data: {
        userId,
        resourceId
      }
    });
  }

  return getResourceById(resourceId, { currentUserId: userId });
};

export const listUserResourceLibrary = async (userId: number) => {
  const include = getResourceInclude(userId);
  const [likedResources, savedResources] = await Promise.all([
    prisma.resource.findMany({
      where: {
        likes: {
          some: { userId }
        }
      },
      orderBy: { resourceId: "desc" },
      include
    }),
    prisma.resource.findMany({
      where: {
        saves: {
          some: { userId }
        }
      },
      orderBy: { resourceId: "desc" },
      include
    })
  ]);

  return {
    likedResources: likedResources.map(mapResource),
    savedResources: savedResources.map(mapResource)
  };
};
