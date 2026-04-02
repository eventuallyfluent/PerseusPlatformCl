import { db } from "@/lib/db";

export async function listInstructors() {
  return db.instructor.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
