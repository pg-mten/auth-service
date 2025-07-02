import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../src/shared/helper/auth.helper';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clean existing data...');
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('🌱 Creating roles...');
  const [superAdmin, adminRole, adminArticle, editor, viewer] =
    await Promise.all([
      prisma.role.create({ data: { name: 'super_admin' } }),
      prisma.role.create({ data: { name: 'admin_role' } }),
      prisma.role.create({ data: { name: 'admin_article' } }),
      prisma.role.create({ data: { name: 'editor' } }),
      prisma.role.create({ data: { name: 'viewer' } }),
    ]);

  console.log('🔐 Creating permissions...');
  await prisma.permission.createMany({
    data: [
      // Super Admin
      { action: 'manage', subject: 'all', role_id: superAdmin.id },

      // Admin Role
      { action: 'read', subject: 'Role', role_id: adminRole.id },
      { action: 'create', subject: 'Role', role_id: adminRole.id },
      { action: 'update', subject: 'Role', role_id: adminRole.id },
      { action: 'delete', subject: 'Role', role_id: adminRole.id },
      { action: 'read', subject: 'Permission', role_id: adminRole.id },
      { action: 'create', subject: 'Permission', role_id: adminRole.id },
      { action: 'update', subject: 'Permission', role_id: adminRole.id },
      { action: 'delete', subject: 'Permission', role_id: adminRole.id },

      // Admin Article
      { action: 'read', subject: 'Article', role_id: adminArticle.id },
      { action: 'create', subject: 'Article', role_id: adminArticle.id },
      { action: 'update', subject: 'Article', role_id: adminArticle.id },
      { action: 'delete', subject: 'Article', role_id: adminArticle.id },

      // Editor (own articles)
      {
        action: 'read',
        subject: 'Article',
        role_id: editor.id,
        conditions: { created_by: '$userId' },
      },
      {
        action: 'create',
        subject: 'Article',
        role_id: editor.id,
        conditions: { created_by: '$userId' },
      },
      {
        action: 'update',
        subject: 'Article',
        role_id: editor.id,
        conditions: { created_by: '$userId' },
      },

      // Viewer (read only own article)
      {
        action: 'read',
        subject: 'Article',
        role_id: viewer.id,
        conditions: { created_by: '$userId' },
      },
    ],
  });

  console.log('👤 Creating users...');
  await prisma.user.createMany({
    data: [
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: await AuthHelper.hashPassword('super123'),
        role_id: superAdmin.id,
      },
      {
        username: 'admin_role_user',
        email: 'adminrole@example.com',
        password: await AuthHelper.hashPassword('adminrole123'),
        role_id: adminRole.id,
      },
      {
        username: 'admin_article_user',
        email: 'adminarticle@example.com',
        password: await AuthHelper.hashPassword('adminarticle123'),
        role_id: adminArticle.id,
      },
      {
        username: 'editor_user',
        email: 'editor@example.com',
        password: await AuthHelper.hashPassword('editor123'),
        role_id: editor.id,
      },
      {
        username: 'viewer_user',
        email: 'viewer@example.com',
        password: await AuthHelper.hashPassword('viewer123'),
        role_id: viewer.id,
      },
    ],
  });

  console.log('✅ Seeder completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
