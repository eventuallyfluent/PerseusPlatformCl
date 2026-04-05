"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createInstructor, updateInstructor, deleteInstructor } from "@/lib/instructors/service";

async function requireAdmin() {
  const session = await auth();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
  if (!isAdmin) redirect("/admin/login");
}

function extractInstructorFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? "") || undefined,
    avatar: String(formData.get("avatar") ?? "") || undefined,
    twitter: String(formData.get("twitter") ?? "") || undefined,
    linkedin: String(formData.get("linkedin") ?? "") || undefined,
    website: String(formData.get("website") ?? "") || undefined,
  };
}

export async function actionCreateInstructor(formData: FormData) {
  await requireAdmin();
  const instructor = await createInstructor(extractInstructorFields(formData));
  revalidatePath("/admin/instructors");
  redirect(`/admin/instructors/${instructor.id}`);
}

export async function actionUpdateInstructor(id: string, formData: FormData) {
  await requireAdmin();
  await updateInstructor(id, extractInstructorFields(formData));
  revalidatePath("/admin/instructors");
  revalidatePath(`/admin/instructors/${id}`);
}

export async function actionDeleteInstructor(id: string) {
  await requireAdmin();
  await deleteInstructor(id);
  revalidatePath("/admin/instructors");
  redirect("/admin/instructors");
}
