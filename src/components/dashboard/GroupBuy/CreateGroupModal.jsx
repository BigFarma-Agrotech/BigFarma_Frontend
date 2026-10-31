import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../../shared/Input";
import Button from "../../shared/Button";
import SuccessModal from "./SuccessModal";
import { createGroup } from "@/lib/groupBuyApi";
import { formatQuantity, getOrderRules, unitLabel } from "@/lib/units";
import { fetchProducts } from "@/lib/api";

const LABEL = "mb-1.5 block text-sm font-medium text-gray-700";
const ERROR = "mt-1 text-sm text-red-600";
const FIELD =
  "w-full rounded-lg border-2 bg-white px-4 text-base placeholder:text-grey-200 focus:border-primary-light focus:outline-none";
const fieldBorder = (hasError) => (hasError ? "border-red-500" : "border-gray-300");

const INITIAL_FORM = {
  groupName: "",
  groupLocation: "",
  productId: "",
  quantity: "",
  minShare: "1",
  maxMembers: "",
  deadline: "",
  isPublic: true,
  description: "",
};

// Local YYYY-MM-DD, used as the date input's min
const todayString = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// The unit, price and quantity limits all come from the chosen product
const validate = (form, today, product) => {
  const errors = {};
  const quantity = Number(form.quantity);
  const maxMembers = Number(form.maxMembers);
  const rules = product ? getOrderRules(product) : null;

  if (!form.groupName.trim()) errors.groupName = "Group name is required";
  if (!form.groupLocation.trim()) errors.groupLocation = "Group location is required";
  if (!form.productId) errors.productId = "Select the item to purchase";
  if (!form.quantity || !Number.isInteger(quantity) || quantity < 1)
    errors.quantity = "Enter a quantity of at least 1";
  else if (rules && quantity < rules.min)
    errors.quantity = `The farmer's minimum order is ${formatQuantity(rules.min, rules.unit)}`;
  else if (rules && rules.max !== null && quantity > rules.max)
    errors.quantity = `The farmer only has ${formatQuantity(rules.max, rules.unit)} in stock`;
  const minShare = Number(form.minShare);
  if (!(minShare > 0)) errors.minShare = "Enter a minimum of at least 1";
  else if (rules?.isCount && !Number.isInteger(minShare))
    errors.minShare = `Use a whole number of ${unitLabel(2, rules.unit)}`;
  else if (quantity > 0 && minShare > quantity) errors.minShare = "Can't be more than the target";
  if (!form.maxMembers || !Number.isInteger(maxMembers) || maxMembers < 2)
    errors.maxMembers = "A group needs at least 2 members";
  if (!form.deadline) errors.deadline = "Pick a deadline";
  else if (form.deadline < today) errors.deadline = "Deadline can't be in the past";
  if (!form.description.trim()) errors.description = "Group description is required";

  return errors;
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  const detail = Array.isArray(data?.detail) ? data.detail[0]?.msg : data?.detail;
  return data?.message || (typeof detail === "string" ? detail : null);
};

const CreateGroupModal = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = todayString();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [createdGroup, setCreatedGroup] = useState(null);

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const products = useMemo(() => {
    if (Array.isArray(productsData?.products)) return productsData.products;
    if (Array.isArray(productsData)) return productsData;
    return [];
  }, [productsData]);

  const selectedProduct = products.find((p) => String(p.id) === String(formData.productId)) || null;
  const selectedRules = selectedProduct ? getOrderRules(selectedProduct) : null;
  const unitPrice = Number(selectedProduct?.discounted_price || selectedProduct?.price || 0);

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(res?.message || "Group created successfully!");
      setCreatedGroup(res?.group ?? res?.data ?? res ?? {});
      setFormData(INITIAL_FORM);
    },
    onError: (error) => {
      console.error("Create group error:", error);
      toast.error(getErrorMessage(error) || "Couldn't create the group. Please try again.");
    },
  });

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mutation.isPending) return;

    const nextErrors = validate(formData, today, selectedProduct);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const quantity = Number(formData.quantity);
    const numericProductId = Number(formData.productId);
    mutation.mutate({
      group_name: formData.groupName.trim(),
      group_description: formData.description.trim(),
      group_location: formData.groupLocation.trim(),
      product_id: Number.isFinite(numericProductId) ? numericProductId : formData.productId,
      target_quantity: formatQuantity(quantity, selectedRules?.unit),
      target_quantity_numeric: quantity,
      min_member_quantity: Number(formData.minShare),
      // Members pay the product's price per unit, so no contribution is sent
      quantity_unit: selectedRules?.unit || undefined,
      is_public: formData.isPublic,
      max_members: Number(formData.maxMembers),
      // End of the chosen day in the user's timezone
      deadline: new Date(`${formData.deadline}T23:59:59`).toISOString(),
    });
  };

  const errorProps = (field) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  const fieldError = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} className={ERROR}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Create A Group</h1>
        <p className="text-sm text-gray-600">
          Create your group by entering the details below. Once created, invite members
          with your sharable link to begin buying together.
        </p>
      </div>

      <form
        className="max-w-3xl space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="groupName" className={LABEL}>
              Group Name
            </label>
            <Input
              type="text"
              id="groupName"
              placeholder="e.g. Ikeja Rice Buyers"
              className={`h-12 placeholder:text-grey-200 ${errors.groupName ? "border-red-500" : ""}`}
              value={formData.groupName}
              onChange={(e) => update("groupName", e.target.value)}
              {...errorProps("groupName")}
            />
            {fieldError("groupName")}
          </div>

          <div>
            <label htmlFor="groupLocation" className={LABEL}>
              Group Location
            </label>
            <Input
              type="text"
              id="groupLocation"
              placeholder="e.g. Lagos"
              className={`h-12 placeholder:text-grey-200 ${errors.groupLocation ? "border-red-500" : ""}`}
              value={formData.groupLocation}
              onChange={(e) => update("groupLocation", e.target.value)}
              {...errorProps("groupLocation")}
            />
            {fieldError("groupLocation")}
          </div>
        </div>

        <div>
          <label htmlFor="productId" className={LABEL}>
            Item to Purchase
          </label>
          <div className="relative">
            <Search
              size={20}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              id="productId"
              className={`${FIELD} ${fieldBorder(errors.productId)} h-12 appearance-none pl-10 pr-10 capitalize`}
              value={formData.productId}
              onChange={(e) => update("productId", e.target.value)}
              disabled={productsLoading || products.length === 0}
              {...errorProps("productId")}
            >
              <option value="">
                {productsLoading
                  ? "Loading products..."
                  : products.length === 0
                    ? "No products available"
                    : "Select product"}
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name || `Product #${product.id}`}
                  {product.location ? ` - ${product.location}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
          {productsError && (
            <p className={ERROR}>
              Couldn&apos;t load products.{" "}
              <button type="button" onClick={() => refetchProducts()} className="underline">
                Retry
              </button>
            </p>
          )}
          {fieldError("productId")}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="quantity" className={LABEL}>
              Target Quantity{selectedRules?.unit ? ` (${unitLabel(2, selectedRules.unit)})` : ""}
            </label>
            <Input
              type="number"
              id="quantity"
              placeholder="e.g. 50"
              className={`h-12 placeholder:text-grey-200 ${errors.quantity ? "border-red-500" : ""}`}
              value={formData.quantity}
              inputMode="numeric"
              min="1"
              step="1"
              onChange={(e) => update("quantity", e.target.value.replace(/\D/g, ""))}
              {...errorProps("quantity")}
            />
            {fieldError("quantity")}
          </div>

          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700" aria-live="polite">
            {selectedProduct ? (
              <>
                <p>
                  Sold per <span className="font-medium">{selectedRules.unit || "unit"}</span> at{" "}
                  <span className="font-medium">₦{unitPrice.toLocaleString()}</span> (set by the farmer)
                </p>
                <p>
                  Minimum order {formatQuantity(selectedRules.min, selectedRules.unit)}
                  {selectedRules.max !== null && `, ${formatQuantity(selectedRules.max, selectedRules.unit)} in stock`}
                </p>
                {Number(formData.quantity) > 0 && (
                  <p className="mt-1 font-medium text-gray-900">
                    Group total: ₦{(unitPrice * Number(formData.quantity)).toLocaleString()} for{" "}
                    {formatQuantity(Number(formData.quantity), selectedRules.unit)}
                  </p>
                )}
              </>
            ) : (
              <p>Pick an item to see its price and unit.</p>
            )}
          </div>

          <div>
            <label htmlFor="minShare" className={LABEL}>
              Minimum per Member{selectedRules?.unit ? ` (${unitLabel(2, selectedRules.unit)})` : ""}
            </label>
            <Input
              type="number"
              id="minShare"
              placeholder="e.g. 1"
              className={`h-12 placeholder:text-grey-200 ${errors.minShare ? "border-red-500" : ""}`}
              value={formData.minShare}
              inputMode="decimal"
              min="1"
              step={selectedRules?.isCount === false ? "0.5" : "1"}
              onChange={(e) => update("minShare", e.target.value)}
              {...errorProps("minShare")}
            />
            {errors.minShare ? (
              fieldError("minShare")
            ) : (
              <p className="mt-1 text-xs text-gray-500">The least each member buys when joining. Members can top up later.</p>
            )}
          </div>

          <div>
            <label htmlFor="maxMembers" className={LABEL}>
              Maximum Members
            </label>
            <Input
              type="number"
              id="maxMembers"
              placeholder="e.g. 10"
              className={`h-12 placeholder:text-grey-200 ${errors.maxMembers ? "border-red-500" : ""}`}
              value={formData.maxMembers}
              inputMode="numeric"
              min="2"
              step="1"
              onChange={(e) => update("maxMembers", e.target.value.replace(/\D/g, ""))}
              {...errorProps("maxMembers")}
            />
            {fieldError("maxMembers")}
          </div>

          <div>
            <label htmlFor="deadline" className={LABEL}>
              Deadline
            </label>
            <Input
              type="date"
              id="deadline"
              min={today}
              className={`h-12 ${errors.deadline ? "border-red-500" : ""}`}
              value={formData.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              {...errorProps("deadline")}
            />
            {fieldError("deadline")}
          </div>

          <div className="flex items-end">
            <label className="flex h-12 cursor-pointer items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => update("isPublic", e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Public group (anyone can find and join)
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={LABEL}>
            Group Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={`${FIELD} ${fieldBorder(errors.description)} resize-none py-3`}
            placeholder="What is the group buying and how will delivery work?"
            value={formData.description}
            onChange={(e) => update("description", e.target.value)}
            {...errorProps("description")}
          />
          {fieldError("description")}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={mutation.isPending}
            className="h-12 py-0 sm:w-36"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="h-12 py-0 sm:w-36">
            {mutation.isPending ? "Creating..." : "Continue"}
          </Button>
        </div>
      </form>

      {createdGroup && (
        <SuccessModal groupId={createdGroup.public_id ?? createdGroup.id} onClose={() => setCreatedGroup(null)} />
      )}
    </div>
  );
};

export default CreateGroupModal;
