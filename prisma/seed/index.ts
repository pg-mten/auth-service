import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../src/shared/helper/auth.helper';

const prisma = new PrismaClient();

async function main() {
  // Cleanup
  await prisma.agentMerchant.deleteMany();
  await prisma.agentDetail.deleteMany();
  await prisma.merchantDetail.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // Roles
  const [
    superAdmin,
    adminRolePermission,
    adminAgent,
    adminMerchant,
    agentRole,
    merchantRole,
  ] = await prisma.$transaction([
    prisma.role.create({ data: { name: 'super_admin' } }),
    prisma.role.create({ data: { name: 'admin_role_permission' } }),
    prisma.role.create({ data: { name: 'admin_agent' } }),
    prisma.role.create({ data: { name: 'admin_merchant' } }),
    prisma.role.create({ data: { name: 'agent' } }),
    prisma.role.create({ data: { name: 'merchant' } }),
  ]);

  // Super Admin User
  const superAdminUser = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: await AuthHelper.hashPassword('password123'),
      role_id: superAdmin.id,
    },
  });

  // === User Agent x2 ===
  const [agentUser1, agentUser2] = await prisma.$transaction([
    prisma.user.create({
      data: {
        username: 'agent_user_1',
        email: 'agent1@example.com',
        password: await AuthHelper.hashPassword('password123'),
        role_id: agentRole.id,
        created_by: superAdminUser.id,
      },
    }),
    prisma.user.create({
      data: {
        username: 'agent_user_2',
        email: 'agent2@example.com',
        password: await AuthHelper.hashPassword('password123'),
        role_id: agentRole.id,
        created_by: superAdminUser.id,
      },
    }),
  ]);

  const [agentDetail1, agentDetail2] = await prisma.$transaction([
    prisma.agentDetail.create({
      data: {
        user_id: agentUser1.id,
        fullname: 'Agent One',
        address: 'Jl. Agent 1',
        phone: '0811111111',
        bank_name: 'BCA',
        account_number: '1111111111',
        account_holder_name: 'AGENT1',
        created_by: superAdminUser.id,
      },
    }),
    prisma.agentDetail.create({
      data: {
        user_id: agentUser2.id,
        fullname: 'Agent Two',
        address: 'Jl. Agent 2',
        phone: '0822222222',
        bank_name: 'BRI',
        account_number: '2222222222',
        account_holder_name: 'AGENT2',
        created_by: superAdminUser.id,
      },
    }),
  ]);

  // === User Merchant x2 ===
  const [merchantUser1, merchantUser2] = await prisma.$transaction([
    prisma.user.create({
      data: {
        username: 'merchant_user_1',
        email: 'merchant1@example.com',
        password: await AuthHelper.hashPassword('password123'),
        role_id: merchantRole.id,
        created_by: superAdminUser.id,
      },
    }),
    prisma.user.create({
      data: {
        username: 'merchant_user_2',
        email: 'merchant2@example.com',
        password: await AuthHelper.hashPassword('password123'),
        role_id: merchantRole.id,
        created_by: superAdminUser.id,
      },
    }),
  ]);

  const [merchantDetail1, merchantDetail2] = await prisma.$transaction([
    prisma.merchantDetail.create({
      data: {
        user_id: merchantUser1.id,
        businessName: 'Merchant One',
        npwp: '01.234.567.8-901.000',
        address: 'Jl. Merchant 1',
        bank_name: 'Mandiri',
        account_number: '3333333333',
        account_holder_name: 'MERCHANT1',
        created_by: superAdminUser.id,
      },
    }),
    prisma.merchantDetail.create({
      data: {
        user_id: merchantUser2.id,
        businessName: 'Merchant Two',
        npwp: '09.876.543.2-123.000',
        address: 'Jl. Merchant 2',
        bank_name: 'BNI',
        account_number: '4444444444',
        account_holder_name: 'MERCHANT2',
        created_by: superAdminUser.id,
      },
    }),
  ]);

  // Relasi Agent-Merchant
  await prisma.agentMerchant.createMany({
    data: [
      {
        agent_id: agentDetail1.id,
        merchant_id: merchantDetail1.id,
        created_by: superAdminUser.id,
      },
      {
        agent_id: agentDetail2.id,
        merchant_id: merchantDetail2.id,
        created_by: superAdminUser.id,
      },
    ],
  });

  // Permissions
  const permissionData = [
    // Super admin
    { action: 'manage', subject: 'all', field: [], role_id: superAdmin.id },

    // Admin Role & Permission
    ...['Role', 'Permission'].flatMap((subject) =>
      ['create', 'read', 'update', 'delete'].map((action) => ({
        action,
        subject,
        field: [],
        role_id: adminRolePermission.id,
        created_by: superAdminUser.id,
      })),
    ),

    // Admin Agent
    ...['create', 'read', 'update', 'delete'].map((action) => ({
      action,
      subject: 'AgentDetail',
      field: [],
      role_id: adminAgent.id,
      created_by: superAdminUser.id,
    })),

    // Admin Merchant
    ...['create', 'read', 'update', 'delete'].map((action) => ({
      action,
      subject: 'MerchantDetail',
      field: [],
      role_id: adminMerchant.id,
      created_by: superAdminUser.id,
    })),

    // Agent (bisa baca detail milik sendiri)
    {
      action: 'read',
      subject: 'AgentDetail',
      field: [],
      role_id: agentRole.id,
      created_by: superAdminUser.id,
      conditions: { user_id: '$userId' },
    },

    // Merchant (bisa baca detail milik sendiri)
    {
      action: 'read',
      subject: 'MerchantDetail',
      field: [],
      role_id: merchantRole.id,
      created_by: superAdminUser.id,
      conditions: { user_id: '$userId' },
    },
  ];

  await prisma.permission.createMany({ data: permissionData });

  console.log('✅ Seeder dengan 2 user agent & merchant berhasil dijalankan!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat menjalankan seeder:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
