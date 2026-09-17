import { PrismaClient, OrgType, MembershipRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await hash("password123", 10);

  const vendorOrg = await prisma.organization.create({
    data: {
      name: "Acme Diagnostics",
      type: OrgType.VENDOR,
    },
  });

  const underwriterOrg = await prisma.organization.create({
    data: {
      name: "Harbor Underwriting",
      type: OrgType.UNDERWRITER,
    },
  });

  // Reserved for later phases — no portal yet
  await prisma.organization.create({
    data: {
      name: "Northshore Hospital",
      type: OrgType.INSURED,
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      email: "vendor@acme.ai",
      name: "Alex Vendor",
      passwordHash,
      memberships: {
        create: {
          organizationId: vendorOrg.id,
          role: MembershipRole.VENDOR,
        },
      },
    },
  });

  const underwriterUser = await prisma.user.create({
    data: {
      email: "underwriter@harborins.com",
      name: "Jordan Underwriter",
      passwordHash,
      memberships: {
        create: {
          organizationId: underwriterOrg.id,
          role: MembershipRole.UNDERWRITER,
        },
      },
    },
  });

  console.log("Seeded users:");
  console.log(`  vendor:      ${vendorUser.email} / password123`);
  console.log(`  underwriter: ${underwriterUser.email} / password123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
