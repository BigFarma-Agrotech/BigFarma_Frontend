// lib/api.jsx

import { API_BASE_URL as baseURL } from "./config";

// An Error that carries the HTTP status like axios errors do, so React Query's
// retry rule can tell a server hiccup (retry) from a missing product (don't)
const httpError = (message, res) => {
    const error = new Error(`${message}: ${res.status} ${res.statusText}`);
    error.response = { status: res.status };
    return error;
};

export const MARKETPLACE_PAGE_SIZE = 10;

// One page of marketplace products. Filtering happens on the server:
// `categories` are category values (or "protein" for all animal products),
// `availability` "in_stock"/"out_of_stock", `locations` towns like "Kano".
export async function fetchProducts({
    page = 1,
    pageSize = 100,
    q = "",
    categories = [],
    availability = [],
    locations = [],
    maxPrice = null,
} = {}) {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (q) params.set("q", q);
    categories.forEach((value) => params.append("category", value));
    availability.forEach((value) => params.append("availability", value));
    locations.forEach((value) => params.append("location", value));
    if (maxPrice !== null && maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
        params.set("max_price", String(maxPrice));
    }

    try {
        const res = await fetch(
            `${baseURL}/marketplace/products?${params}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        
        if (!res.ok) {
            throw httpError("Failed to fetch products", res);
        }
        
        const data = await res.json();
        
        // Ensure we always return an object with a products array
        return {
            products: data.products || [],
            total_count: data.total_count || 0,
            page: data.page || 1,
            page_size: data.page_size || pageSize,
            total_pages: data.total_pages || 1,
            has_next: data.has_next || false,
            has_previous: data.has_previous || false
        };
    } catch (error) {
        console.error("Error in fetchProducts:", error);
        throw error;
    }
}

/** Towns that have listed products, for the location filter. */
export async function fetchProductLocations() {
    const res = await fetch(`${baseURL}/marketplace/products/locations`);
    if (!res.ok) throw httpError("Failed to fetch locations", res);
    const data = await res.json();
    return Array.isArray(data?.locations) ? data.locations : [];
}

export async function fetchProductById(id) {
    
    try {
        const res = await fetch(
            `${baseURL}/marketplace/products/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (!res.ok) {
            throw httpError("Failed to fetch product", res);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`Error in fetchProductById for ID ${id}:`, error);
        throw error;
    }
}
