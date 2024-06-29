import db from "./dbConn";

export const getSharedWorkspaces = async (userId: number, page: number) => {
  const workspaces = await db.sharedWorkspace.findMany({
    where: {
      userId,
    },
    skip: page * 10,
    take: 10,
    include: {
      workspace: {
        include: {
          user: true,
        },
      },
    },
  });

  return workspaces;
};

export const getSharedWorkspacesTotal = async (userId: number) => {
  const workspaces = await db.sharedWorkspace.findMany({
    where: {
      userId,
    },
  });

  return workspaces.length;
};

export const findSharedWorkspaceByName = async (userId: number, name: string) => {
  const workspace = await db.sharedWorkspace.findMany({
    where: {
      userId,
      workspace: {
        name,
      },
    },
    include: {
      workspace: {
        include: {
          user: true,
        },
      },
    },
  });

  return workspace;
};

export const addMultiToSharedWorkspace = async (workspaceId: number, members: string[]) => {
  const userIds = await db.user.findMany({
    where: {
      email: {
        in: members,
      },
    },
    select: {
      id: true,
    },
  });
  if (userIds.length !== members.length) {
    return { error: "Some users do not exist" };
  };

  const sharedWorkspace = userIds.map((user) => {
    return {
      userId: user.id,
      workspaceId,
    };
  });

  await db.sharedWorkspace.createMany({
    data: sharedWorkspace,
    skipDuplicates: true,
  });

  return userIds;
};

export const getSharedUsers = async (workspaceId: number) => {
  const users = await db.sharedWorkspace.findMany({
    where: {
      workspaceId,
    },
    select: {
      user: true,
    },
  });

  return users;
}

export const removeSharedWorkspace = async (workspaceId: number, userId: number) => {
  await db.sharedWorkspace.delete({
    where: {
      userId_workspaceId: {
        userId: userId,
        workspaceId: workspaceId,
      },
    },
  });
}