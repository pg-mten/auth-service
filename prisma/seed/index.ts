import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../src/shared/helper/auth.helper';

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Create Roles
  const adminRole = await prisma.role.create({ data: { name: 'admin' } });
  const editorRole = await prisma.role.create({ data: { name: 'editor' } });
  const viewerRole = await prisma.role.create({ data: { name: 'viewer' } });

  // Create Permissions
  await prisma.permission.createMany({
    data: [
      // Admin - Full access
      { action: 'manage', subject: 'all', role_id: adminRole.id },

      // Editor - CRUD Article (no delete)
      { action: 'read', subject: 'Article', role_id: editorRole.id },
      { action: 'create', subject: 'Article', role_id: editorRole.id },
      { action: 'update', subject: 'Article', role_id: editorRole.id },

      // Viewer - only read Article with condition: created_by == user.id
      {
        action: 'read',
        subject: 'Article',
        role_id: viewerRole.id,
        conditions: {
          created_by: '$userId', // this will be replaced dynamically
        },
      },
    ],
  });

  // Create Users
  await prisma.user.createMany({
    data: [
      {
        username: 'admin_user',
        email: 'admin@example.com',
        password: await AuthHelper.hashPassword('password123'), // hash properly in real use
        role_id: adminRole.id,
      },
      {
        username: 'editor_user',
        email: 'editor@example.com',
        password: await AuthHelper.hashPassword('password123'), // hash properly in real use
        role_id: editorRole.id,
      },
      {
        username: 'viewer_user',
        email: 'viewer@example.com',
        password: await AuthHelper.hashPassword('password123'), // hash properly in real use
        role_id: viewerRole.id,
      },
    ],
  });

  console.log('✅ Seeder executed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
