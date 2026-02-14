import { Test, TestingModule } from '@nestjs/testing';
import { AgentDetailService } from './agent-detail.service';
import { PRISMA_SERVICE } from '../prisma/prisma.provider';

describe('AgentDetailService', () => {
  let service: AgentDetailService;

  const mockPrismaClient = {
    agentDetail: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  // Factory for fully populated agent detail records (as returned by Prisma)
  const makeAgentRecord = (i: number) => ({
    id: i,
    userId: i * 10,
    username: `agent${i}`,
    fullname: `Agent ${i}`,
    address: `${i}00 Main St`,
    phone: `0812345678${i}`,
    bankCode: `00${i}`,
    bankName: `Bank ${i}`,
    accountNumber: `ACC-${i}`,
    accountHolderName: `Holder ${i}`,
    user: {
      id: i * 10,
      email: `agent${i}@test.com`,
      password: 'hashed',
      roleId: 1,
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentDetailService,
        { provide: PRISMA_SERVICE, useValue: mockPrismaClient },
      ],
    }).compile();

    service = module.get<AgentDetailService>(AgentDetailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all agents mapped to AgentDto with all fields', async () => {
      const agents = [
        makeAgentRecord(1),
        makeAgentRecord(2),
        makeAgentRecord(3),
      ];
      mockPrismaClient.agentDetail.findMany.mockResolvedValue(agents);

      const result = await service.findAll();

      expect(mockPrismaClient.agentDetail.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
      expect(result).toHaveLength(3);

      // Verify all fields on first element
      expect(result[0].agentId).toBe(1);
      expect(result[0].userId).toBe(10);
      expect(result[0].email).toBe('agent1@test.com');
      expect(result[0].fullname).toBe('Agent 1');
      expect(result[0].address).toBe('100 Main St');
      expect(result[0].phone).toBe('08123456781');
      expect(result[0].bankName).toBe('Bank 1');
      expect(result[0].accountNumber).toBe('ACC-1');
      expect(result[0].accountHolderName).toBe('Holder 1');

      // Verify identity of remaining elements
      expect(result[1].agentId).toBe(2);
      expect(result[1].email).toBe('agent2@test.com');

      expect(result[2].agentId).toBe(3);
      expect(result[2].email).toBe('agent3@test.com');
    });
  });

  describe('findAllNames', () => {
    it('should return agent names', async () => {
      const agents = [
        { id: 1, fullname: 'Agent One' },
        { id: 2, fullname: 'Agent Two' },
        { id: 3, fullname: 'Agent Three' },
      ];
      mockPrismaClient.agentDetail.findMany.mockResolvedValue(agents);

      const result = await service.findAllNames();

      expect(mockPrismaClient.agentDetail.findMany).toHaveBeenCalledWith({
        select: { id: true, fullname: true },
      });
      expect(result).toHaveLength(3);

      expect(result[0].id).toBe(1);
      expect(result[0].fullname).toBe('Agent One');

      expect(result[1].id).toBe(2);
      expect(result[1].fullname).toBe('Agent Two');

      expect(result[2].id).toBe(3);
      expect(result[2].fullname).toBe('Agent Three');
    });
  });

  describe('findIds', () => {
    it('should return agents by ids with all fields', async () => {
      const agents = [
        makeAgentRecord(1),
        makeAgentRecord(2),
        makeAgentRecord(3),
      ];
      mockPrismaClient.agentDetail.findMany.mockResolvedValue(agents);

      const result = await service.findIds([1, 2, 3]);

      expect(mockPrismaClient.agentDetail.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        include: { user: true },
      });
      expect(result).toHaveLength(3);

      // Verify all fields on first element
      expect(result[0].agentId).toBe(1);
      expect(result[0].userId).toBe(10);
      expect(result[0].email).toBe('agent1@test.com');
      expect(result[0].fullname).toBe('Agent 1');
      expect(result[0].address).toBe('100 Main St');
      expect(result[0].phone).toBe('08123456781');
      expect(result[0].bankName).toBe('Bank 1');
      expect(result[0].accountNumber).toBe('ACC-1');
      expect(result[0].accountHolderName).toBe('Holder 1');

      expect(result[1].agentId).toBe(2);
      expect(result[2].agentId).toBe(3);
    });
  });

  describe('findOneThrow', () => {
    it('should return one agent with all fields', async () => {
      const agent = makeAgentRecord(1);
      mockPrismaClient.agentDetail.findUniqueOrThrow.mockResolvedValue(agent);

      const result = await service.findOneThrow(1);

      expect(
        mockPrismaClient.agentDetail.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(result.agentId).toBe(1);
      expect(result.userId).toBe(10);
      expect(result.email).toBe('agent1@test.com');
      expect(result.fullname).toBe('Agent 1');
      expect(result.address).toBe('100 Main St');
      expect(result.phone).toBe('08123456781');
      expect(result.bankName).toBe('Bank 1');
      expect(result.accountNumber).toBe('ACC-1');
      expect(result.accountHolderName).toBe('Holder 1');
    });

    it('should throw if agent not found', async () => {
      mockPrismaClient.agentDetail.findUniqueOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.findOneThrow(999)).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should update agent detail and return updated record', async () => {
      const dto = { fullname: 'Updated Name' };
      const agent = makeAgentRecord(1);
      const updated = { ...agent, fullname: 'Updated Name' };

      mockPrismaClient.agentDetail.findUniqueOrThrow.mockResolvedValue(agent);
      mockPrismaClient.agentDetail.update.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(
        mockPrismaClient.agentDetail.findUniqueOrThrow,
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
      expect(mockPrismaClient.agentDetail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining(dto),
      });
      expect(result.fullname).toBe('Updated Name');
    });

    it('should throw if agent to update not found', async () => {
      mockPrismaClient.agentDetail.findUniqueOrThrow.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.update(999, { fullname: 'X' })).rejects.toThrow(
        'Not found',
      );
      expect(mockPrismaClient.agentDetail.update).not.toHaveBeenCalled();
    });
  });
});
