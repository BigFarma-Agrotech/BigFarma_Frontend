import { axios } from "../lib/axios";
import { endpoints } from "../components/config/endpoints";
import { categoryLabel } from "./categories";

// The axios instance already attaches the bearer token and base URL.
const GROUPS_URL = endpoints().groupBuy.list;

export const groupDetails = async (groupId) => {
  try {
    const res = await axios.get(`${GROUPS_URL}/${groupId}`);
    // Accept either the bare group or a { data: group } / { group } envelope
    return res.data?.group ?? (res.data?.data && !Array.isArray(res.data.data) ? res.data.data : res.data);
  } catch (error) {
    console.error("Group details API error:", error.response || error.message);
    throw error;
  }
};

const asList = (data) => {
  if (Array.isArray(data)) return data;
  for (const key of ["groups", "data", "items", "results"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

// Public groups anyone can join, plus the user's own (including private ones
// and ones they created but haven't paid into yet), without duplicates
export const fetchGroups = async () => {
  const [publicGroups, mine] = await Promise.all([
    axios.get(`${GROUPS_URL}/public`).then((res) => asList(res.data)),
    axios.get(GROUPS_URL).then((res) => asList(res.data)).catch(() => []),
  ]);
  const seen = new Set();
  return [...mine, ...publicGroups].filter((group) => {
    const key = group.public_id ?? group.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Pay for a share of the group with Paystack: { quantity, contact_name,
// contact_phone, email?, callback_url } -> { reference, authorization_url, amount, ... }.
// Paystack sends the buyer back to callback_url, where /payments/verify confirms it.
export const groupCheckout = async (groupId, payload) => {
  const res = await axios.post(`${GROUPS_URL}/${encodeURIComponent(groupId)}/checkout`, payload);
  return res.data;
};

export const createGroup = async (payload) => {
  const res = await axios.post(GROUPS_URL, payload);
  return res.data;
};

const firstNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

/**
 * Maps both the API group shape (group_name, group_location, max_members,
 * current_members, progress_percentage, individual_contribution, product{...})
 * and the mock shape in src/lib/GroupBuy.js (name, location, slot, slotTaken,
 * price, image) onto one view model. Slot values are null when unknown.
 */
export const normalizeGroup = (group = {}) => {
  const product = group.product && typeof group.product === "object" ? group.product : null;
  const totalSlots = firstNumber(group.max_members, group.total_slots, group.slot);
  const rawTaken = firstNumber(
    group.current_members,
    group.member_count,
    group.members_count,
    Array.isArray(group.members) ? group.members.length : null,
    group.slots_taken,
    group.slotTaken
  );
  const takenSlots = rawTaken === null ? null : Math.max(rawTaken, 0);
  const slotsRemaining =
    totalSlots === null ? null : Math.max(totalSlots - (takenSlots ?? 0), 0);

  let progress = firstNumber(group.progress_percentage);
  if (progress === null && totalSlots) progress = ((takenSlots ?? 0) / totalSlots) * 100;
  progress = Math.min(Math.max(Math.round(progress ?? 0), 0), 100);

  const image =
    product?.image ||
    (Array.isArray(product?.images) ? product.images[0] : product?.images) ||
    group.image ||
    "";

  return {
    // public_id is what group URLs use; sample groups only have an id
    id: group.public_id ?? group.id,
    name: group.group_name || group.name || product?.name || "Untitled group",
    description: group.group_description || group.description || "",
    location: group.group_location || group.location || "",
    category: categoryLabel(product?.category || group.category),
    image,
    status: group.status || "",
    // Members pay this per unit of the product
    price: firstNumber(group.unit_price, group.individual_contribution, group.price),
    unitPrice: firstNumber(group.unit_price, group.individual_contribution, group.price),
    currentQuantity: firstNumber(group.current_quantity) ?? 0,
    remainingQuantity: firstNumber(
      group.remaining_quantity,
      group.target_quantity_numeric != null
        ? Math.max(Number(group.target_quantity_numeric) - Number(group.current_quantity || 0), 0)
        : null
    ),
    membersCount: firstNumber(group.members_count, group.current_members),
    // The least each member buys when joining, and the least a new member can buy now
    minShare: firstNumber(group.min_member_quantity) ?? 1,
    joinMinimum: firstNumber(group.join_minimum, group.min_member_quantity) ?? 1,
    isMember: Boolean(group.is_member),
    isCreator: Boolean(group.is_creator),
    productName: product?.name || group.product_name || "",
    quantity: firstNumber(group.target_quantity_numeric, group.total),
    quantityUnit: group.quantity_unit || "",
    escrow: firstNumber(group.group_wallet_balance) ?? 0,
    deadline: group.deadline || null,
    totalSlots,
    takenSlots,
    slotsRemaining,
    progress,
  };
};
