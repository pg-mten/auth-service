import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../src/shared/helper/auth.helper';
import { Role } from '../../src/shared/constant/auth.constant';

const prisma = new PrismaClient();

async function main() {
  // Cleanup
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
  ] = await prisma.$transaction(
    Object.values(Role).map((role) => {
      return prisma.role.create({ data: { name: role } });
    }),
  );

  // Super Admin User
  const superAdminUser = await prisma.user.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: await AuthHelper.hashPassword('password123'),
      roleId: superAdmin.id,
    },
  });

  // === User Agent x2 ===
  const [agentUser1, agentUser2] = await prisma.$transaction([
    prisma.user.create({
      data: {
        username: 'agent_user_1',
        email: 'agent1@example.com',
        password: await AuthHelper.hashPassword('password123'),
        roleId: agentRole.id,
        createdBy: superAdminUser.id,
      },
    }),
    prisma.user.create({
      data: {
        username: 'agent_user_2',
        email: 'agent2@example.com',
        password: await AuthHelper.hashPassword('password123'),
        roleId: agentRole.id,
        createdBy: superAdminUser.id,
      },
    }),
  ]);

  const [agentDetail1, agentDetail2] = await prisma.$transaction([
    prisma.agentDetail.create({
      data: {
        userId: agentUser1.id,
        fullname: 'Agent One',
        address: 'Jl. Agent 1',
        phone: '0811111111',
        bankName: 'BCA',
        accountNumber: '1111111111',
        accountHolderName: 'AGENT1',
        createdBy: superAdminUser.id,
      },
    }),
    prisma.agentDetail.create({
      data: {
        userId: agentUser2.id,
        fullname: 'Agent Two',
        address: 'Jl. Agent 2',
        phone: '0822222222',
        bankName: 'BRI',
        accountNumber: '2222222222',
        accountHolderName: 'AGENT2',
        createdBy: superAdminUser.id,
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
        roleId: merchantRole.id,
        createdBy: superAdminUser.id,
      },
    }),
    prisma.user.create({
      data: {
        username: 'merchant_user_2',
        email: 'merchant2@example.com',
        password: await AuthHelper.hashPassword('password123'),
        roleId: merchantRole.id,
        createdBy: superAdminUser.id,
      },
    }),
  ]);

  const [merchantDetail1, merchantDetail2] = await prisma.$transaction([
    prisma.merchantDetail.create({
      data: {
        userId: merchantUser1.id,
        businessName: 'Merchant One',
        npwp: '01.234.567.8-901.000',
        address: 'Jl. Merchant 1',
        bankName: 'Mandiri',
        accountNumber: '3333333333',
        accountHolderName: 'MERCHANT1',
        createdBy: superAdminUser.id,
      },
    }),
    prisma.merchantDetail.create({
      data: {
        userId: merchantUser2.id,
        businessName: 'Merchant Two',
        npwp: '09.876.543.2-123.000',
        address: 'Jl. Merchant 2',
        bankName: 'BNI',
        accountNumber: '4444444444',
        accountHolderName: 'MERCHANT2',
        createdBy: superAdminUser.id,
      },
    }),
  ]);

  // Permissions
  const permissionData = [
    // Super admin
    { action: 'manage', subject: 'all', field: [], roleId: superAdmin.id },

    // Admin Role & Permission
    ...['Role', 'Permission'].flatMap((subject) =>
      ['create', 'read', 'update', 'delete'].map((action) => ({
        action,
        subject,
        field: [],
        roleId: adminRolePermission.id,
        createdBy: superAdminUser.id,
      })),
    ),

    // Admin Agent
    ...['create', 'read', 'update', 'delete'].map((action) => ({
      action,
      subject: 'AgentDetail',
      field: [],
      roleId: adminAgent.id,
      createdBy: superAdminUser.id,
    })),

    // Admin Merchant
    ...['create', 'read', 'update', 'delete'].map((action) => ({
      action,
      subject: 'MerchantDetail',
      field: [],
      roleId: adminMerchant.id,
      createdBy: superAdminUser.id,
    })),

    // Agent (bisa baca detail milik sendiri)
    {
      action: 'read',
      subject: 'AgentDetail',
      field: [],
      roleId: agentRole.id,
      createdBy: superAdminUser.id,
      conditions: { userId: '$userId' },
    },

    // Merchant (bisa baca detail milik sendiri)
    {
      action: 'read',
      subject: 'MerchantDetail',
      field: [],
      roleId: merchantRole.id,
      createdBy: superAdminUser.id,
      conditions: { userId: '$userId' },
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
