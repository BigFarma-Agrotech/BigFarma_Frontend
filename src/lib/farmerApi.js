import { axios } from '../lib/axios';
import { endpoints } from '../components/config/endpoints';

// The shared axios instance attaches the Authorization header on every request.
export const farmerApi = {
  // Orders. The list route is `/orders/`: without the slash the backend
  // answers with a redirect to its own host, which bypasses the proxy and is
  // blocked by CORS.
  getOrders: () => axios.get(`${endpoints().farmerOrders.orders}/`),

  getProductOrders: (productId) =>
    axios.get(`${endpoints().farmerOrders.orders}/${productId}`),

  getOrder: (orderId) =>
    axios.get(`${endpoints().farmerOrders.orders}/${orderId}`),

  updateOrderStatus: (orderId, statusData) =>
    axios.put(
      `${endpoints().farmerOrders.update_order_status}/${orderId}/status`,
      statusData
    ),

  // Products
  getProducts: () => axios.get(endpoints().farmerProducts.get_product),

  getProduct: (productId) =>
    axios.get(`${endpoints().farmerProducts.get_product}/${productId}`),

  createProduct: (productData) => {
    const formData = new FormData();

    // Append basic fields
    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (key === 'images' && Array.isArray(productData[key])) {
          // Handle multiple images
          productData[key].forEach((image) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    // Don't set Content-Type: the browser adds multipart/form-data with the
    // correct boundary. Forcing application/json makes axios serialise the
    // FormData to JSON and the image files are dropped.
    return axios.post(endpoints().farmerProducts.create_product, formData);
  },
  updateProduct: (productId, productData) => {
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      if (productData[key] !== undefined && productData[key] !== null) {
        if (key === 'images' && Array.isArray(productData[key])) {
          productData[key].forEach((image) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, productData[key]);
        }
      }
    });

    // Let the browser set multipart/form-data + boundary (see createProduct).
    return axios.put(
      `${endpoints().farmerProducts.update_product}/${productId}`,
      formData
    );
  },
  deleteProduct: (productId) =>
    axios.delete(`${endpoints().farmerProducts.delete_product}/${productId}`),

  restockProduct: (productId, quantityData) =>
    axios.put(
      `${endpoints().farmerProducts.update_product}/${productId}`,
      quantityData
    ),

  updateProductStatus: (productId, statusData) =>
    axios.put(
      `${endpoints().farmerProducts.update_product}/${productId}`,
      statusData
    ),
};

export default farmerApi;
