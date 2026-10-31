import { axios } from "../lib/axios";
import { endpoints } from "../components/config/endpoints";

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

export const fetchGroups = async () => {
  const res = await axios.get(GROUPS_URL);
  const data = res.data;
  if (Array.isArray(data)) return data;
  for (const key of ["groups", "data", "items", "results"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
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
    category: product?.category || group.category || "",
    image,
    status: group.status || "",
    price: firstNumber(group.individual_contribution, group.price),
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
