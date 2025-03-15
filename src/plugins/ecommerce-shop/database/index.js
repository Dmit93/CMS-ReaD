/**
 * E-commerce Database
 *
 * Handles database operations for the e-commerce plugin
 */

import { prisma } from "@/lib/db";

// Database schema extensions (would be in prisma schema in a real app)
const ecommerceSchema = {
  Product: {
    id: "string",
    name: "string",
    slug: "string",
    description: "string",
    price: "float",
    salePrice: "float?",
    sku: "string",
    stock: "int",
    images: "string[]",
    categoryId: "string?",
    featured: "boolean",
    status: "string", // draft, published, archived
    attributes: "json",
    createdAt: "datetime",
    updatedAt: "datetime",
  },
  Category: {
    id: "string",
    name: "string",
    slug: "string",
    description: "string?",
    parentId: "string?",
    image: "string?",
    products: "Product[]",
  },
  Attribute: {
    id: "string",
    name: "string",
    type: "string", // text, number, boolean, select
    options: "string[]", // For select type
    required: "boolean",
  },
  Order: {
    id: "string",
    userId: "string?",
    status: "string", // pending, processing, completed, cancelled
    total: "float",
    items: "json",
    shippingAddress: "json",
    billingAddress: "json",
    paymentMethod: "string",
    paymentStatus: "string", // pending, paid, failed
    shippingMethod: "string",
    trackingNumber: "string?",
    notes: "string?",
    createdAt: "datetime",
    updatedAt: "datetime",
  },
};

// Mock data for development
const mockProducts = [
  {
    id: "prod-1",
    name: "Premium T-Shirt",
    slug: "premium-t-shirt",
    description: "High-quality cotton t-shirt with a modern fit.",
    price: 29.99,
    salePrice: 24.99,
    sku: "TS-001",
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
    ],
    categoryId: "cat-1",
    featured: true,
    status: "published",
    attributes: {
      color: "Black",
      size: "M",
      material: "100% Cotton",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-2",
    name: "Slim Fit Jeans",
    slug: "slim-fit-jeans",
    description: "Classic slim fit jeans with stretch comfort.",
    price: 59.99,
    salePrice: null,
    sku: "JN-001",
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&q=80",
    ],
    categoryId: "cat-2",
    featured: false,
    status: "published",
    attributes: {
      color: "Blue",
      size: "32",
      material: "98% Cotton, 2% Elastane",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-3",
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    description: "Premium wireless headphones with noise cancellation.",
    price: 199.99,
    salePrice: 179.99,
    sku: "WH-001",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    ],
    categoryId: "cat-3",
    featured: true,
    status: "published",
    attributes: {
      color: "Black",
      batteryLife: "20 hours",
      connectivity: "Bluetooth 5.0",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-4",
    name: "Smart Watch",
    slug: "smart-watch",
    description: "Feature-rich smartwatch with health tracking.",
    price: 249.99,
    salePrice: 229.99,
    sku: "SW-001",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
    ],
    categoryId: "cat-3",
    featured: true,
    status: "published",
    attributes: {
      color: "Silver",
      batteryLife: "48 hours",
      waterResistant: "Yes",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-5",
    name: "Leather Wallet",
    slug: "leather-wallet",
    description: "Handcrafted genuine leather wallet with multiple card slots.",
    price: 49.99,
    salePrice: null,
    sku: "LW-001",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
      "https://images.unsplash.com/photo-1517254797898-04edd251bfb3?w=800&q=80",
    ],
    categoryId: "cat-4",
    featured: false,
    status: "published",
    attributes: {
      color: "Brown",
      material: "Genuine Leather",
      cardSlots: "8",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCategories = [
  {
    id: "cat-1",
    name: "Clothing",
    slug: "clothing",
    description: "Shirts, pants, and other apparel",
    parentId: null,
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  },
  {
    id: "cat-2",
    name: "Pants",
    slug: "pants",
    description: "Jeans, trousers, and shorts",
    parentId: "cat-1",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  },
  {
    id: "cat-3",
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets and electronic devices",
    parentId: null,
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  },
  {
    id: "cat-4",
    name: "Accessories",
    slug: "accessories",
    description: "Wallets, bags, and other accessories",
    parentId: null,
    image:
      "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=800&q=80",
  },
];

const mockAttributes = [
  {
    id: "attr-1",
    name: "Color",
    type: "select",
    options: [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Brown",
      "Silver",
    ],
    required: true,
  },
  {
    id: "attr-2",
    name: "Size",
    type: "select",
    options: ["XS", "S", "M", "L", "XL", "XXL"],
    required: true,
  },
  {
    id: "attr-3",
    name: "Material",
    type: "text",
    options: [],
    required: false,
  },
  {
    id: "attr-4",
    name: "Battery Life",
    type: "text",
    options: [],
    required: false,
  },
  {
    id: "attr-5",
    name: "Water Resistant",
    type: "boolean",
    options: [],
    required: false,
  },
];

// Mock database service
class EcommerceDatabase {
  constructor() {
    this.products = [...mockProducts];
    this.categories = [...mockCategories];
    this.attributes = [...mockAttributes];
    this.orders = [];
  }

  // Product methods
  async getProducts(filters = {}) {
    let filteredProducts = [...this.products];

    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === filters.categoryId,
      );
    }

    if (filters.featured !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.featured === filters.featured,
      );
    }

    if (filters.status) {
      filteredProducts = filteredProducts.filter(
        (p) => p.status === filters.status,
      );
    }

    return filteredProducts;
  }

  async getProductById(id) {
    return this.products.find((p) => p.id === id) || null;
  }

  async getProductBySlug(slug) {
    return this.products.find((p) => p.slug === slug) || null;
  }

  async createProduct(productData) {
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id, productData) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedProduct = {
      ...this.products[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    };

    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }

  // Category methods
  async getCategories(parentId = null) {
    if (parentId === null) {
      return this.categories;
    }
    return this.categories.filter((c) => c.parentId === parentId);
  }

  async getCategoryById(id) {
    return this.categories.find((c) => c.id === id) || null;
  }

  async getCategoryBySlug(slug) {
    return this.categories.find((c) => c.slug === slug) || null;
  }

  async createCategory(categoryData) {
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...categoryData,
    };

    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id, categoryData) {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCategory = {
      ...this.categories[index],
      ...categoryData,
    };

    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  async deleteCategory(id) {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;

    // Check if category has products
    const hasProducts = this.products.some((p) => p.categoryId === id);
    if (hasProducts) return false;

    // Check if category has children
    const hasChildren = this.categories.some((c) => c.parentId === id);
    if (hasChildren) return false;

    this.categories.splice(index, 1);
    return true;
  }

  // Attribute methods
  async getAttributes() {
    return this.attributes;
  }

  async getAttributeById(id) {
    return this.attributes.find((a) => a.id === id) || null;
  }

  async createAttribute(attributeData) {
    const newAttribute = {
      id: `attr-${Date.now()}`,
      ...attributeData,
    };

    this.attributes.push(newAttribute);
    return newAttribute;
  }

  async updateAttribute(id, attributeData) {
    const index = this.attributes.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updatedAttribute = {
      ...this.attributes[index],
      ...attributeData,
    };

    this.attributes[index] = updatedAttribute;
    return updatedAttribute;
  }

  async deleteAttribute(id) {
    const index = this.attributes.findIndex((a) => a.id === id);
    if (index === -1) return false;

    this.attributes.splice(index, 1);
    return true;
  }

  // Order methods
  async getOrders(filters = {}) {
    let filteredOrders = [...this.orders];

    if (filters.status) {
      filteredOrders = filteredOrders.filter(
        (o) => o.status === filters.status,
      );
    }

    if (filters.userId) {
      filteredOrders = filteredOrders.filter(
        (o) => o.userId === filters.userId,
      );
    }

    return filteredOrders;
  }

  async getOrderById(id) {
    return this.orders.find((o) => o.id === id) || null;
  }

  async createOrder(orderData) {
    const newOrder = {
      id: `order-${Date.now()}`,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  async updateOrder(id, orderData) {
    const index = this.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const updatedOrder = {
      ...this.orders[index],
      ...orderData,
      updatedAt: new Date().toISOString(),
    };

    this.orders[index] = updatedOrder;
    return updatedOrder;
  }
}

// Create a singleton instance
const ecommerceDB = new EcommerceDatabase();

// Setup function to initialize the database
export async function setupEcommerceDatabase() {
  console.log("Setting up e-commerce database");
  // In a real implementation, this would create tables if they don't exist
  return ecommerceDB;
}

// Export the database instance
export { ecommerceDB };
