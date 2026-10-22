import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Plus, Inbox } from "lucide-react";
import { toast } from "react-toastify";
import DataTablePage from "../farmer/components/farmer-table/dataTable";
import {
  useFarmerProducts,
  useDeleteFarmerProduct,
  useRestockFarmerProduct,
  useUpdateFarmerProduct,
} from "../../../hooks/useFarmerProducts";
import AddProductModal from "./AddProductModal";
import DeleteProductModal from "./DeleteProductModal";
import RestockProductModal from "./RestockProductModal";
import Button from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import { parseApiError } from "@/lib/apiError";
import {
  extractProducts,
  getProductImage,
  splitQuantity,
} from "../../../lib/farmerOrder";
import filterIcon from "../../../assets/icons/filter.svg";

// Fallback images
import eggs from "../../../assets/ProductImages/categories/Egg image.png";
import onions from "../../../assets/ProductImages/onions.png";
import watermelon from "../../../assets/ProductImages/watermelon.png";
import carrot from "../../../assets/ProductImages/categories/Carrot image.png";
import rice from "../../../assets/ProductImages/Rice.png";
import tomatoes from "../../../assets/ProductImages/tomatoes.png";
import vegetable from "../../../assets/ProductImages/categories/vegetables.png";
import cassava from "../../../assets/ProductImages/cassava.png";

const productImages = {
  Eggs: eggs,
  Onions: onions,
  Watermelon: watermelon,
  Carrot: carrot,
  Rice: rice,
  Tomatoes: tomatoes,
  Vegetable: vegetable,
  Cassava: cassava,
};

const productFilterOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unpublished", label: "Unpublished" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "pending", label: "Pending" },
];

const statusLabels = {
  active: "Active",
  unpublished: "Unpublished",
  out_of_stock: "Out of stock",
  pending: "Pending",
};

// The API has no single status field: unlisted products are hidden from the
// marketplace, unapproved ones are awaiting review
const getProductStatus = (product) => {
  if (product.is_listed === false) return "unpublished";
  if (product.is_approved === false) return "pending";
  if (product.availability === "out_of_stock") return "out_of_stock";
  return "active";
};

const statusBadgeClasses = {
  active: "bg-green-100 text-green-800",
  unpublished: "bg-gray-100 text-gray-800",
  out_of_stock: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const MyProducts = () => {
  const { data: apiProducts, isLoading, error, refetch } = useFarmerProducts();
  const deleteMutation = useDeleteFarmerProduct();
  const restockMutation = useRestockFarmerProduct();
  const listingMutation = useUpdateFarmerProduct();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // API product being edited in the product modal; null when adding
  const [editingProduct, setEditingProduct] = useState(null);

  const [filter, setFilter] = useState("all");
  // Search term from the dashboard header (?q=...)
  const [searchParams] = useSearchParams();
  const searchTerm = (searchParams.get("q") || "").trim().toLowerCase();
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Transform API data for the table
  const transformedProducts = useMemo(() => {
    return extractProducts(apiProducts).map((product, index) => ({
      id: product.id?.toString() || `product-${index}`,
      product: product.name || `Product ${index + 1}`,
      // An <img> takes a single URL (joining two with a comma breaks it)
      image: getProductImage(product) || productImages[product.name] || watermelon,
      productID: product.code || `#${product.id || index}`,
      price: product.price
        ? `₦${parseFloat(product.price).toLocaleString()}`
        : "₦0",
      quantity: `${product.quantity || "0"} ${product.unit || ""}`.trim(),
      status: getProductStatus(product),
      originalData: product,
    }));
  }, [apiProducts]);

  // Filter data based on selection
  const filteredProducts = useMemo(() => {
    return transformedProducts.filter(
      (item) =>
        (filter === "all" || item.status === filter) &&
        (!searchTerm || item.product.toLowerCase().includes(searchTerm))
    );
  }, [transformedProducts, filter, searchTerm]);

  const handleFilterSelect = (value) => {
    setFilter(value);
    setIsFilterDropdownOpen(false);
  };

  const currentFilterLabel =
    productFilterOptions.find((option) => option.value === filter)?.label ||
    "All";

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleRestockClick = (product) => {
    setSelectedProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleDeleteConfirm = (productId) => {
    deleteMutation.mutate(productId, {
      onSuccess: () => {
        toast.success("Product Deleted Successfully");
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to delete product: ${error.message}`);
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
      },
    });
  };

  const handleRestockConfirm = (productId, quantity) => {
    // The backend stores quantity as text with its unit ("20 kg"); keep the
    // product's existing unit
    const { unit } = splitQuantity(selectedProduct?.originalData?.quantity);
    restockMutation.mutate(
      { productId, quantity: `${Number(quantity)} ${unit}` },
      {
        onSuccess: () => {
          toast.success("Product restocked successfully");
          setIsRestockModalOpen(false);
          setSelectedProduct(null);
          refetch();
        },
        onError: (error) => {
          toast.error(`Failed to restock: ${error.message}`);
          setIsRestockModalOpen(false);
          setSelectedProduct(null);
        },
      }
    );
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setIsAddProductModalOpen(true);
  };

  // Publishing lists the product on the marketplace; unpublishing hides it
  const handleToggleListing = (item) => {
    const publish = item.originalData?.is_listed === false;
    listingMutation.mutate(
      { productId: item.originalData?.id, productData: { is_listed: publish } },
      {
        onSuccess: () => {
          toast.success(
            publish
              ? `${item.product} is now on the marketplace`
              : `${item.product} is hidden from the marketplace`
          );
        },
        onError: (error) => {
          toast.error(
            parseApiError(
              error,
              publish ? "Failed to publish product" : "Failed to unpublish product"
            ).message
          );
        },
      }
    );
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.originalData);
    setIsAddProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsAddProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    closeProductModal();
    refetch();
  };

  const productColumns = [
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.image}
            alt={item.product}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = watermelon;
            }}
          />
          <button
            type="button"
            onClick={() => handleEditClick(item)}
            title="Edit product"
            className="text-left text-sm font-medium text-gray-900 underline-offset-2 hover:text-primary hover:underline"
          >
            {item.product}
          </button>
        </div>
      ),
    },
    {
      key: "productID",
      label: "Product Code",
    },
    {
      key: "price",
      label: "Price",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.price}</span>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusBadgeClasses[item.status] || "bg-blue-100 text-blue-800"
          )}
        >
          {statusLabels[item.status] || item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (item) => (
        <div className="flex gap-2">
          {(() => {
            const isPublished = item.originalData?.is_listed !== false;
            const isToggling =
              listingMutation.isPending &&
              listingMutation.variables?.productId === item.originalData?.id;
            return (
              <button
                type="button"
                onClick={() => handleToggleListing(item)}
                disabled={isToggling}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  isPublished
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-primary-subtle text-primary hover:bg-green-100"
                )}
              >
                {isToggling
                  ? "Saving..."
                  : isPublished
                    ? "Unpublish"
                    : "Publish"}
              </button>
            );
          })()}
          <button
            type="button"
            onClick={() => handleRestockClick(item)}
            className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
          >
            Restock
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(item)}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const hasProducts = transformedProducts.length > 0;

  const emptyProductsState = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <Inbox className="h-10 w-10 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">
        {hasProducts ? "No Products Match Filter" : "No Products Yet"}
      </h3>
      <p className="mb-4 max-w-md text-sm text-gray-600">
        {hasProducts
          ? "No products match your current filter. Try changing the filter to see more products."
          : "You haven't added any products yet. Start by adding your first product to sell on the marketplace."}
      </p>
      {!hasProducts && (
        <Button
          onClick={openAddProduct}
          className="h-10 py-0"
        >
          Add New Product
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            My Products
          </h1>
          <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary">
            {transformedProducts.length}{" "}
            {transformedProducts.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isFilterDropdownOpen}
              className="flex h-10 min-w-[140px] items-center gap-2 rounded-lg border border-primary bg-white px-4 text-sm font-medium text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              <img src={filterIcon} alt="" className="h-4 w-4" />
              <span className="flex-1 text-left">{currentFilterLabel}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isFilterDropdownOpen && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute left-0 z-30 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg sm:left-auto sm:right-0">
                {productFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFilterSelect(option.value)}
                    className={cn(
                      "flex w-full items-center px-4 py-2 text-left text-sm",
                      filter === option.value
                        ? "bg-primary-subtle text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasProducts && (
            <Button
              onClick={openAddProduct}
              className="h-10 py-0"
            >
              Add Product
              <Plus className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      <DataTablePage
        title="products"
        data={filteredProducts}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        columns={productColumns}
        emptyState={emptyProductsState}
        hideHeader
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={closeProductModal}
        onProductAdded={handleProductSaved}
        product={editingProduct}
        onProductUpdated={handleProductSaved}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={() => handleDeleteConfirm(selectedProduct?.originalData?.id)}
        product={selectedProduct}
        isLoading={deleteMutation.isPending}
      />

      <RestockProductModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleRestockConfirm}
        product={selectedProduct}
        isLoading={restockMutation.isPending}
      />
    </div>
  );
};

export default MyProducts;
