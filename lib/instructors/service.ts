import { db } from "@/lib/db";

export async function listInstructors() {
  return db.instructor.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, avatar: true },
  });
}

export async function getInstructor(id: string) {
  return db.instructor.findUnique({ where: { id } });
}

export type InstructorInput = {
  name: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
};

export async function createInstructor(data: InstructorInput) {
  return db.instructor.create({
    data: {
      name: data.name,
      bio: data.bio ?? null,
      avatar: data.avatar ?? null,
      twitter: data.twitter ?? null,
      linkedin: data.linkedin ?? null,
      website: data.website ?? null,
    },
  });
}

export async function updateInstructor(id: string, data: Partial<InstructorInput>) {
  return db.instructor.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.bio !== undefined && { bio: data.bio || null }),
      ...(data.avatar !== undefined && { avatar: data.avatar || null }),
      ...(data.twitter !== undefined && { twitter: data.twitter || null }),
      ...(data.linkedin !== undefined && { linkedin: data.linkedin || null }),
      ...(data.website !== undefined && { website: data.website || null }),
    },
  });
}

export async function deleteInstructor(id: string) {
  return db.instructor.delete({ where: { id } });
}
