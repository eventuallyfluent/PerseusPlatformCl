import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 0. Admin user
  const passwordHash = await bcrypt.hash("password", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@perseus.local" },
    update: { passwordHash, isAdmin: true },
    create: {
      email: "admin@perseus.local",
      name: "Admin",
      passwordHash,
      isAdmin: true,
    },
  });
  console.log(`Admin user: ${admin.email} (password: password)`);

  // 1. Instructor
  const instructor = await prisma.instructor.upsert({
    where: { id: "seed-instructor-1" },
    update: {},
    create: {
      id: "seed-instructor-1",
      name: "Jane Smith",
      bio: "Experienced educator with 10+ years teaching web development. Passionate about making complex topics accessible to everyone.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane-smith",
      website: "https://janesmith.dev",
      twitter: "janesmith",
      linkedin: "janesmith",
    },
  });

  console.log(`Created instructor: ${instructor.name}`);

  // 2. Course
  const course = await prisma.course.upsert({
    where: { slug: "intro-to-web-dev" },
    update: {},
    create: {
      slug: "intro-to-web-dev",
      title: "Introduction to Web Development",
      subtitle: "Build your first website from scratch using HTML, CSS, and JavaScript",
      description:
        "A comprehensive beginner's guide to web development. You'll learn the fundamentals of HTML structure, CSS styling, and JavaScript interactivity — then bring it all together by building a real project.",
      status: "PUBLISHED",
      thumbnailUrl: null,
      previewVideoUrl: null,
      learningOutcomes: [
        "Understand how HTML, CSS, and JavaScript work together",
        "Build and style web pages from scratch",
        "Add interactivity with JavaScript",
        "Deploy a website to the internet",
      ],
      whoItsFor: [
        "Complete beginners with no coding experience",
        "Designers who want to understand front-end code",
        "Anyone curious about how websites are built",
      ],
      includes: [
        "10 hours of video content",
        "Downloadable project files",
        "Certificate of completion",
        "Lifetime access",
      ],
      instructorId: instructor.id,
    },
  });

  console.log(`Created course: ${course.title}`);

  // 3. Offer + Price
  const offer = await prisma.offer.upsert({
    where: { id: "seed-offer-1" },
    update: {},
    create: {
      id: "seed-offer-1",
      name: "Full Access",
      type: "ONE_TIME",
      isActive: true,
      courseId: course.id,
      prices: {
        create: {
          amount: 99.0,
          currency: "USD",
          isDefault: true,
        },
      },
    },
  });

  console.log(`Created offer: ${offer.name} ($99.00 one-time)`);

  // 4. Stripe Gateway
  const gateway = await prisma.gateway.upsert({
    where: { slug: "stripe" },
    update: { isActive: true },
    create: {
      id: "seed-gateway-stripe",
      name: "Stripe",
      slug: "stripe",
      isActive: true,
    },
  });

  console.log(`Created gateway: ${gateway.name} (active: ${gateway.isActive})`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
