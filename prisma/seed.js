const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
 
(async function main() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'fakeemail@fakedomain.com' },
      update: {},
      create: {
        firstname: 'Jane',
        lastname: 'Doe',
        username: 'fakeusername123',
        password: '61be55a8e2f6b4e172338bddf184d6dbee29c98853e0a0485ecee7f27b9af0b4',
        address: '123 Fake Street Faketown, USA 12345',
        email: 'fakeemail@fakedomain.com',
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