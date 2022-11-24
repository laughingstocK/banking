const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
 
(async function main() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'a@a.com' },
      update: {},
      create: {
        firstname: 'Krerkkiat',
        lastname: 'Hemadhulin',
        username: 'abcdefg',
        password: 'aaaa',
        address: 'abcd',
        email: 'a@a.com',
      },
    });
 
    console.log('Create 1 author with 2 quotes: ', user);
  } catch(e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();