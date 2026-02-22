import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { Link } from "react-router-dom";
import { IoIosStar } from "react-icons/io";
import { useCart } from "@/hooks";
import { toast } from "react-toastify";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useEffect, useState } from "react";

export default function ProductsList({ selectedCategory, onClearCategory }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Process data when it arrives
  useEffect(() => {
    if (data) {
      console.log("Raw data from API:", data);
      
      // Extract products array from the response with safe navigation
      let productsArray = [];
      
      // Check if data exists and has products property
      if (data && data.products && Array.isArray(data.products)) {
        productsArray = data.products;
        console.log("Found products array with length:", productsArray.length);
      } else if (data && Array.isArray(data)) {
        productsArray = data;
        console.log("Data is array with length:", productsArray.length);
      }
      
      if (productsArray.length > 0) {
        console.log("First product sample:", productsArray[0]);
      } else {
        console.log("No products found in response");
      }
      
      setProducts(productsArray);
    }
  }, [data]);

  // Log available categories for debugging
  useEffect(() => {
    if (products.length > 0) {
      const categories = [...new Set(products.map(p => p.category))];
      console.log("Available categories:", categories);
      console.log("Selected category:", selectedCategory);
    }
  }, [products, selectedCategory]);

  const handleAddToCart = (product) => {
    if (product.availability !== "in_stock") {
      toast.error("This product is out of stock");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const getProductImage = (product) => {
    if (!product.images) return "https://via.placeholder.com/300";
    
    // Handle different image formats
    if (Array.isArray(product.images)) {
      // Filter out base64 strings or get the first valid image
      const validImage = product.images.find(img => 
        img && typeof img === 'string' && !img.startsWith('data:image')
      );
      return validImage || product.images[0] || "https://via.placeholder.com/300";
    }
    
    return product.images || "https://via.placeholder.com/300";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error loading products: {error.message}</p>
        <button 
          onClick={() => refetch()} 
          className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        if (!product || !product.category) return false;
        
        // Handle category matching (case insensitive)
        const productCategory = product.category.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();
        
        // Map your UI categories to API categories
        if (selectedCat === "vegetables" && productCategory === "crop") return true;
        if (selectedCat === "fruits" && productCategory === "crop") return true;
        if (selectedCat === "grains" && productCategory === "crop") return true;
        if (selectedCat === "protein" && productCategory === "livestock") return true;
        
        return productCategory === selectedCat;
      })
    : products;

  // Show message if no products
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No products available</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Show selected category */}
      {selectedCategory && (
        <div className="mb-4 flex items-center gap-2">
          <p className="text-gray-600">
            Showing: <span className="font-semibold">{selectedCategory}</span>
          </p>
          <button
            onClick={() => onClearCategory?.()}
            className="text-sm text-red-500 underline hover:text-red-700"
          >
            Clear filter
          </button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No products found in this category
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {filteredProducts.map((product) => (
            <div key={product.id}>
              <div className="p-4 bg-white shadow rounded-md">
                <div className="w-full h-48 rounded-t-md bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product.name || "Product"}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>
                {/* details  */}
                <div className="space-y-1">
                  {/* name  */}
                  <div className="flex items-center gap-3 pt-3">
                    <h3 className="font-medium capitalize text-lg">{product.name || "Unnamed Product"}</h3>
                    {product.availability === "in_stock" ? (
                      <p className="text-xs text-green-700 py-1 px-2 rounded-md bg-green-50 capitalize">
                        In stock
                      </p>
                    ) : (
                      <p className="text-sm text-red-700 p-3 rounded-md bg-red-100 capitalize">
                        Out of stock
                      </p>
                    )}
                  </div>

                  {/* price  */}
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">₦{product.discounted_price || product.price || 0}</p>
                    {product.discount_percentage > 0 && (
                      <p className="text-xs text-gray-500 line-through">₦{product.price}</p>
                    )}
                    <p className="font-normal text-sm">
                      per {product.quantity?.split(" ").length > 1
                        ? product.quantity.split(" ").slice(1).join(" ")
                        : product.quantity || "item"}
                    </p>
                  </div>
                  {/* rating  */}
                  <div className="flex items-center gap-1">
                    <IoIosStar className="inline text-yellow-500" />
                    <p className="text-sm">
                      {product.average_rating || 0} ({product.total_ratings || 0})
                    </p>
                  </div>
                </div>

                {/* buttons  */}
                <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-1 mt-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.availability !== "in_stock"}
                    className={`w-full py-2 underline capitalize ${
                      product.availability === "in_stock"
                        ? "text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] cursor-pointer"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Add to cart
                  </button>
                  <Link
                    to={`/marketplace/products/${product.id}`}
                    className="w-full py-2 text-white text-center rounded-md capitalize bg-[var(--color-primary)] hover:bg-opacity-90"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
