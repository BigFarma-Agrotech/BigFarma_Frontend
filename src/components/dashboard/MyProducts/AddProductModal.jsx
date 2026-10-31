import { useEffect, useState } from "react";
import axiosDefault from "axios";
import { toast } from "react-toastify";
import { ImagePlus, X } from "lucide-react";
import { axios } from "../../../lib/axios";
import { endpoints } from "../../config/endpoints";
import Button from "@/components/shared/Button";
import { parseApiError } from "@/lib/apiError";
import { useUpdateFarmerProduct } from "../../../hooks/useFarmerProducts";
import { UNIT_GROUPS, formatQuantity, isCountUnit, normalizeUnit, parseQuantity, unitLabel } from "@/lib/units";
import formHeader from "../../../assets/images/addProductHeader.webp";

const initialFormData = {
  name: "",
  category: "",
  quantity: "",
  min_quantity: "1",
  price: "",
  location: "",
  description: "",
  images: [], // base64 strings
  unit: "kg",
};

const categories = ["crop", "livestock"];

const KNOWN_UNITS = UNIT_GROUPS.flatMap(({ units }) => units);

// Why the stock / minimum order can't be saved, or null
const orderRulesError = ({ quantity, unit, min_quantity }) => {
  const stock = Number(quantity);
  const min = Number(min_quantity);
  if (!(min > 0)) return "Minimum order must be greater than 0.";
  if (isCountUnit(unit) && (!Number.isInteger(stock) || !Number.isInteger(min))) {
    return `Quantity and minimum order must be whole numbers of ${unitLabel(2, unit)}.`;
  }
  if (stock > 0 && min > stock) return "Minimum order can't be more than the quantity in stock.";
  return null;
};

// Prefills the form from an existing product (edit) or starts empty (add).
// Existing images are URLs and are sent back as-is to keep them.
const toFormState = (product) => {
  if (!product) return { form: initialFormData, previews: [] };
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const stock = parseQuantity(product.quantity);
  return {
    form: {
      ...initialFormData,
      name: product.name || "",
      category: product.category || "",
      quantity: stock.amount ?? "",
      unit: normalizeUnit(product.unit) || stock.unit || "kg",
      min_quantity: String(product.min_order_quantity ?? 1),
      price: product.price ?? "",
      location: product.location || "",
      description: product.description || "",
      images,
    },
    previews: images,
  };
};

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
const fieldClass =
  "h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light";

// Pass `product` (the API product) to edit it; leave it out to add a new one
const AddProductModal = ({ isOpen, onClose, onProductAdded, product, onProductUpdated }) => {
  const isEditing = Boolean(product);
  const updateMutation = useUpdateFarmerProduct();
  const [formData, setFormData] = useState(initialFormData);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Start from the product being edited (or a blank form) each time it opens
  useEffect(() => {
    if (!isOpen) return;
    const next = toFormState(product);
    setFormData(next.form);
    setImagePreviews(next.previews);
  }, [isOpen, product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Convert selected images to base64 strings
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImagePreviews([]);
  };

  const handleUpdate = () => {
    if (!formData.images.length) {
      toast.error("Please keep at least one product image.");
      return;
    }
    if (formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters long.");
      return;
    }
    const rulesError = orderRulesError(formData);
    if (rulesError) {
      toast.error(rulesError);
      return;
    }

    setIsLoading(true);
    updateMutation.mutate(
      {
        productId: product.public_id,
        productData: {
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim(),
          quantity: formatQuantity(formData.quantity, formData.unit),
          unit: formData.unit,
          min_order_quantity: Number(formData.min_quantity),
          price: Number(formData.price),
          location: formData.location.trim(),
          images: formData.images,
          // Products used to be created with a 100% discount by mistake, which
          // priced them at ₦0; clear that, but keep any real discount
          ...(Number(product.discount_percentage) >= 100 && { discount_percentage: 0 }),
        },
      },
      {
        onSuccess: (data) => {
          toast.success("Product updated successfully!");
          if (onProductUpdated) onProductUpdated(data);
          else onClose();
        },
        onError: (error) => {
          toast.error(parseApiError(error, "Unable to update product").message);
        },
        onSettled: () => setIsLoading(false),
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    if (isEditing) {
      handleUpdate();
      return;
    }
    const rulesError = orderRulesError(formData);
    if (rulesError) {
      toast.error(rulesError);
      return;
    }
    if (formData.name && formData.category && formData.location) {
      setIsLoading(true);

      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        quantity: formatQuantity(formData.quantity, formData.unit),
        unit: formData.unit,
        min_order_quantity: Number(formData.min_quantity),
        price: formData.price,
        discount_percentage: 0,
        location: formData.location,
        images: formData.images,
      };

      try {
        const res = await axios.post(
          endpoints().farmerProducts.create_product,
          payload
        );

        const data = res.data;

        if (res.status === 200 || res.status === 201) {
          toast.success(data?.message || "Product added successfully!");
          resetForm();
          // Parent refetches the products list (no full page reload needed)
          if (onProductAdded) onProductAdded(data);
          else onClose();
        } else {
          toast.error(data?.message || "Network error. Please try again.");
        }
      } catch (error) {
        if (axiosDefault.isAxiosError(error) && error.response) {
          toast.error(
            error.response.data?.detail ||
              error.response.data?.message ||
              "Unable to add product"
          );
        } else {
          toast.error("Unable to connect to the server");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 sm:p-6"
      >
        <img
          src={formHeader}
          alt=""
          className="mb-4 h-auto w-full rounded-lg object-cover"
        />

        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2
              id="add-product-title"
              className="text-lg font-bold text-gray-900 sm:text-xl"
            >
              {isEditing ? "Edit Product" : "Add Your Produce to the Marketplace"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isEditing
                ? "Update the details buyers see for this product."
                : "Showcase your fresh produce to buyers. Add clear details so they know exactly what you're offering."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className={labelClass}>
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Product Name"
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`${fieldClass} capitalize`}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="unit" className={labelClass}>
                Sold per (unit)
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className={fieldClass}
                required
              >
                {!KNOWN_UNITS.includes(formData.unit) && (
                  <option value={formData.unit}>{formData.unit}</option>
                )}
                {UNIT_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="price" className={labelClass}>
                Price per {formData.unit} (₦)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter Price"
                className={fieldClass}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="quantity" className={labelClass}>
                Quantity in stock ({unitLabel(2, formData.unit)})
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter Quantity"
                className={fieldClass}
                required
                min="0"
                step={isCountUnit(formData.unit) ? "1" : "0.01"}
              />
            </div>
            <div>
              <label htmlFor="min_quantity" className={labelClass}>
                Minimum order per buyer ({unitLabel(2, formData.unit)})
              </label>
              <input
                type="number"
                id="min_quantity"
                name="min_quantity"
                value={formData.min_quantity}
                onChange={handleInputChange}
                placeholder="e.g. 5"
                aria-describedby="min_quantity_help"
                className={fieldClass}
                required
                min={isCountUnit(formData.unit) ? "1" : "0.01"}
                step={isCountUnit(formData.unit) ? "1" : "0.01"}
              />
              <p id="min_quantity_help" className="mt-1 text-xs text-gray-500">
                Buyers can&apos;t order less than this. They add more one {formData.unit} at a time.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Farm Location or Pickup Address"
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Product Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your product (quality, freshness, etc.). Minimum of 20 characters"
              className={`${fieldClass} h-auto resize-y py-3`}
              required
            />
          </div>

          <div>
            <span className={labelClass}>{isEditing ? "Images" : "Add Image"}</span>
            <label
              htmlFor="images"
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center transition-colors hover:border-primary-light"
            >
              <ImagePlus className="h-10 w-10 text-gray-400" aria-hidden="true" />
              <span className="text-sm font-medium text-primary">
                Upload images
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </span>
              <input
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {isEditing ? "Product Images:" : "Selected Images:"}
                </p>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={preview} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-10 py-0"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="h-10 py-0">
              {isEditing
                ? isLoading
                  ? "Saving..."
                  : "Save Changes"
                : isLoading
                  ? "Adding Product..."
                  : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
