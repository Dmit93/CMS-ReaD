import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ecommerceDB } from "../database";
import { useEcommerceStore } from "../store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Check,
  Info,
  Star,
  Truck,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const addToCart = useEcommerceStore((state) => state.addToCart);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const productData = await ecommerceDB.getProductById(id);
        if (!productData) {
          navigate("/shop");
          return;
        }

        setProduct(productData);
        setSelectedImage(0);

        // Initialize selected attributes with defaults
        if (productData.attributes) {
          const initialAttributes = {};
          Object.entries(productData.attributes).forEach(([key, value]) => {
            initialAttributes[key] = value;
          });
          setSelectedAttributes(initialAttributes);
        }

        // Load related products from same category
        if (productData.categoryId) {
          const related = await ecommerceDB.getProducts({
            categoryId: productData.categoryId,
          });
          setRelatedProducts(related.filter((p) => p.id !== id).slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value, 10);
    if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAttributeChange = (name, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedAttributes);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity, selectedAttributes);
      navigate("/shop/cart");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6 flex items-center"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex space-x-2 overflow-auto pb-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`cursor-pointer border rounded-md overflow-hidden w-20 h-20 flex-shrink-0 ${selectedImage === index ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`${product.name} - view ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {product.categoryId && (
                <Badge variant="outline">{product.categoryId}</Badge>
              )}
              {product.featured && (
                <Badge className="bg-primary">Featured</Badge>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <Badge
                  variant="outline"
                  className="text-orange-700 border-orange-300 bg-orange-50"
                >
                  Low Stock
                </Badge>
              )}
              {product.stock <= 0 && (
                <Badge
                  variant="outline"
                  className="text-red-700 border-red-300 bg-red-50"
                >
                  Out of Stock
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center mt-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  4.0 (24 reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold">
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <Badge className="bg-red-500">
                    Save ${(product.price - product.salePrice).toFixed(2)}
                  </Badge>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>
          </div>

          {/* Product Attributes */}
          <div className="space-y-4">
            {Object.entries(product.attributes || {}).map(
              ([name, defaultValue]) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-2">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </label>
                  <Select
                    value={selectedAttributes[name] || defaultValue}
                    onValueChange={(value) =>
                      handleAttributeChange(name, value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* For simplicity, using some predefined options */}
                      {[
                        "Black",
                        "White",
                        "Red",
                        "Blue",
                        "Green",
                        "S",
                        "M",
                        "L",
                        "XL",
                        "Yes",
                        "No",
                      ].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="mx-4 w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
                <span className="ml-4 text-sm text-muted-foreground">
                  {product.stock} available
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              Buy Now
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Meta Info */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 mr-2 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm text-muted-foreground">
                  Free standard shipping on orders over $50
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 mr-2 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">30-Day Returns</p>
                <p className="text-sm text-muted-foreground">
                  Shop with confidence with our 30-day return policy
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Product Details</p>
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-4">
          <div className="prose max-w-none">
            <p>{product.description}</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget
              aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies
              lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet
              nisl.
            </p>
            <p>
              Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl,
              eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel
              ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl
              sit amet nisl.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="specifications" className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.attributes || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b">
                <span className="font-medium">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span>{value}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">SKU</span>
              <span>{product.sku}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Stock</span>
              <span>{product.stock} units</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Customer Reviews</h3>
              <Button>Write a Review</Button>
            </div>

            <div className="border rounded-lg p-6">
              <p className="text-center text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="cursor-pointer"
                onClick={() => navigate(`/shop/product/${relatedProduct.id}`)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{relatedProduct.name}</h3>
                  <div className="flex items-center mt-2">
                    {relatedProduct.salePrice ? (
                      <>
                        <span className="font-bold">
                          ${relatedProduct.salePrice.toFixed(2)}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          ${relatedProduct.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
