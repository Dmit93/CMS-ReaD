// Mock PrismaClient for browser environment
class MockPrismaClient {
  plugin = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => data.data,
    update: async (data: any) => data.data,
    delete: async () => ({}),
    upsert: async (data: any) => data.create,
  };

  // Add other models as needed
  $transaction: any = async (fn: any) => fn(this);
}

// Export a mock client for browser environment
export const prisma = new MockPrismaClient();
