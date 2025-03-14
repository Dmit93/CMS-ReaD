// Mock PrismaClient for browser environment
class MockPrismaClient {
  plugin = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => data.data,
    update: async (data: any) => data.data,
    delete: async () => ({}),
    upsert: async (data: any) => data.create,
    count: async () => 0,
  };

  content = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => data.data,
    update: async (data: any) => data.data,
    delete: async () => ({}),
    upsert: async (data: any) => data.create,
  };

  contentMetadata = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => data.data,
    update: async (data: any) => data.data,
    delete: async () => ({}),
    upsert: async (data: any) => data.create,
    deleteMany: async () => ({}),
  };

  // Add other models as needed
  $transaction: any = async (fn: any) => fn(this);
}

// Export a mock client for browser environment
const prisma = new MockPrismaClient();

export default prisma;
