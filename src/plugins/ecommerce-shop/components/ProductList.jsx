import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ecommerceDB } from "../database";
import { useEcommerceStore } from "../store";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Filter, Tag, Search } from "lucide-react";

const ProductList = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
  const addToCart = useEcommerceStore((state) => state.addToCart);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load categories
        const allCategories = await ecommerceDB.getCategories();
        setCategories(allCategories);

        // Load products
        const filters = {};
        if (categoryId) {
          filters.categoryId = categoryId;
          setSelectedCategory(categoryId);
        }

        const productList = await ecommerceDB.getProducts(filters);
        setProducts(productList);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (value === "all") {
      navigate("/shop");
    } else {
      navigate(`/shop/category/${value}`);
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleProductClick = (productId) => {
    navigate(`/shop/product/${productId}`);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case "price-high":
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "featured":
        default:
          return b.featured ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {categoryId
            ? categories.find((c) => c.id === categoryId)?.name || "Products"
            : "All Products"}
        </h1>
        <p className="text-muted-foreground">
          {categoryId
            ? categories.find((c) => c.id === categoryId)?.description ||
              "Browse our products"
            : "Browse our collection of high-quality products"}
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <p className="text-xl text-muted-foreground mb-4">
            No products found
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="flex flex-col h-full overflow-hidden"
            >
              <div
                className="aspect-square relative overflow-hidden cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
                {product.salePrice && (
                  <Badge className="absolute top-2 right-2 bg-red-500">
                    Sale
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Featured
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-2">
                <CardTitle
                  className="text-lg cursor-pointer hover:text-primary"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="flex items-center mb-2">
                  {product.salePrice ? (
                    <>
                      <span className="text-lg font-bold">
                        ${product.salePrice.toFixed(2)}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
