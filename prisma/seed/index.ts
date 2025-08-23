import { PrismaClient } from '@prisma/client';
import { AuthHelper } from '../../src/shared/helper/auth.helper';
import { Role } from '../../src/shared/constant/auth.constant';
import Decimal from 'decimal.js';

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

  // === User Admin x3 ===
  const [adminRolePermissionUser, adminAgentUser, adminMerchantUser] =
    await prisma.$transaction([
      prisma.user.create({
        data: {
          username: 'admin_role_permission_user',
          email: 'admin_role_permission@example.com',
          password: await AuthHelper.hashPassword('password123'),
          roleId: adminRolePermission.id,
          createdBy: superAdminUser.id,
        },
      }),
      prisma.user.create({
        data: {
          username: 'admin_agent_user',
          email: 'admin_agent@example.com',
          password: await AuthHelper.hashPassword('password123'),
          roleId: adminAgent.id,
          createdBy: superAdminUser.id,
        },
      }),
      prisma.user.create({
        data: {
          username: 'admin_merchant_user',
          email: 'admin_merchant@example.com',
          password: await AuthHelper.hashPassword('password123'),
          roleId: adminMerchant.id,
          createdBy: superAdminUser.id,
        },
      }),
    ]);

  const adminDetails = await prisma.$transaction([
    prisma.adminDetail.create({
      data: {
        userId: adminRolePermissionUser.id,
        fullname: 'Admin Role Permission',
        address: 'Jl. Admin Role Permission',
        phone: '0898764123',
        createdBy: superAdminUser.id,
      },
    }),
    prisma.adminDetail.create({
      data: {
        userId: adminAgentUser.id,
        fullname: 'Admin Agent',
        address: 'Jl. Admin Agent',
        phone: '08461349795',
        createdBy: superAdminUser.id,
      },
    }),
    prisma.adminDetail.create({
      data: {
        userId: adminMerchantUser.id,
        fullname: 'Admin Merchant',
        address: 'Jl. Admin Merchant',
        phone: '0841357662',
        createdBy: superAdminUser.id,
      },
    }),
  ]);
  console.log({ adminDetails });

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

  const agentDetails = await prisma.$transaction([
    prisma.agentDetail.create({
      data: {
        userId: agentUser1.id,
        fullname: 'Agent One',
        address: 'Jl. Agent 1',
        phone: '0811111111',
        bankName: 'BCA',
        accountNumber: '1111111111',
        accountHolderName: 'AGENT1',
        balance: new Decimal(12100600.12),
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
        balance: new Decimal(54500125.12),
        createdBy: superAdminUser.id,
      },
    }),
  ]);

  console.log({ agentDetails });

  // === User Merchant x2 ===
  const [merchantUser1, merchantUser2, merchantUser3, merchantUser4] =
    await prisma.$transaction([
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
      prisma.user.create({
        data: {
          username: 'merchant_user_3',
          email: 'merchant3@example.com',
          password: await AuthHelper.hashPassword('password123'),
          roleId: merchantRole.id,
          createdBy: superAdminUser.id,
        },
      }),
      prisma.user.create({
        data: {
          username: 'merchant_user_4',
          email: 'merchant4@example.com',
          password: await AuthHelper.hashPassword('password123'),
          roleId: merchantRole.id,
          createdBy: superAdminUser.id,
        },
      }),
    ]);

  const merchantDetails = await prisma.$transaction([
    prisma.merchantDetail.create({
      data: {
        userId: merchantUser1.id,
        businessName: 'Merchant One',
        npwp: '01.234.567.8-901.111',
        address: 'Jl. Merchant 1',
        bankName: 'Mandiri',
        accountNumber: '111111111',
        accountHolderName: 'MERCHANT1',
        balance: new Decimal(94130125.12),
        createdBy: superAdminUser.id,
      },
    }),
    prisma.merchantDetail.create({
      data: {
        userId: merchantUser2.id,
        businessName: 'Merchant Two',
        npwp: '09.876.543.2-123.222',
        address: 'Jl. Merchant 2',
        bankName: 'BNI',
        accountNumber: '22222222',
        accountHolderName: 'MERCHANT2',
        balance: new Decimal(97300125.12),
        createdBy: superAdminUser.id,
      },
    }),
    prisma.merchantDetail.create({
      data: {
        userId: merchantUser3.id,
        businessName: 'Merchant Three',
        npwp: '10.443.252.9-534.333',
        address: 'Jl. Merchant 3',
        bankName: 'BNI',
        accountNumber: '333333333',
        accountHolderName: 'MERCHANT3',
        balance: new Decimal(107300125.12),
        createdBy: superAdminUser.id,
      },
    }),
    prisma.merchantDetail.create({
      data: {
        userId: merchantUser4.id,
        businessName: 'Merchant Four',
        npwp: '78.225.445.9-363.444',
        address: 'Jl. Merchant 4',
        bankName: 'BNI',
        accountNumber: '444444444',
        accountHolderName: 'MERCHANT4',
        balance: new Decimal(45232789.12),
        createdBy: superAdminUser.id,
      },
    }),
  ]);
  console.log({ merchantDetails });

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

  console.log(
    '✅ Seeder dengan 3 user admin & 3 user agent & 3 user merchant berhasil dijalankan!',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error saat menjalankan seeder:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
