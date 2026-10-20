// lib/api.jsx

const baseURL = import.meta.env.VITE_SERVER_URL;

export async function fetchProducts() {
    console.log("Fetching products from:", `${baseURL}/marketplace/products?skip=0&limit=100`);
    
    try {
        const res = await fetch(
            `${baseURL}/marketplace/products?skip=0&limit=100`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        
        if (!res.ok) {
            throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Products API response:", data);
        
        // Ensure we always return an object with a products array
        return {
            products: data.products || [],
            total_count: data.total_count || 0,
            page: data.page || 1,
            page_size: data.page_size || 100,
            has_next: data.has_next || false,
            has_previous: data.has_previous || false
        };
    } catch (error) {
        console.error("Error in fetchProducts:", error);
        throw error;
    }
}

export async function fetchProductById(id) {
    console.log("Fetching product:", id, "from:", `${baseURL}/marketplace/products/${id}`);
    
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
            throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Product detail API response:", data);
        return data;
    } catch (error) {
        console.error(`Error in fetchProductById for ID ${id}:`, error);
        throw error;
    }
}
