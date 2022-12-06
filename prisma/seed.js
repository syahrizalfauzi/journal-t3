// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const settingsSeed = prisma.settings.upsert({
    where: { id: "settings" },
    update: {},
    create: {
      id: "settings",
      maxArticlesPerLatestEdition: 5,
      reviewersCount: 2,
    },
  });

  const aboutPageSeed = prisma.page.upsert({
    where: {url : "about"},
    update: {},
    create: {
      url: "about",
      name: "About Page",
      data: "null",
    }
  })

  const homePageSeed = prisma.page.upsert({
    where: {url : ""},
    update: {},
    create: {
      url: "",
      name: "Home Page",
      data: "null",
    }
  })

  await Promise.all([settingsSeed, aboutPageSeed, homePageSeed]);

}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
