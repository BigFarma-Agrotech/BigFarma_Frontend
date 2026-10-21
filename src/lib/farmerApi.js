// src/services/farmerApi.js
import { axios } from '../lib/axios';
import { endpoints } from '../components/config/endpoints';

// The shared axios instance attaches the current access token to every request.

export const farmerApi = {
  // Orders (your existing endpoints)
  getOrders: () =>
    axios.get(endpoints().farmerOrders.orders),

  getProductOrders: (productId) =>
    axios.get(`${endpoints().farmerOrders.orders}/${productId}`),

  getOrder: (orderId) =>
    axios.get(`${endpoints().farmerOrders.orders}/${orderId}`),

  updateOrderStatus: (orderId, statusData) =>
    axios.patch(`${endpoints().farmerOrders}/${orderId}/status`, statusData, {
      headers: {
        'content-type': 'application/json',
      },
    }),

  // Products endpoints (new)
  getProducts: () =>
    axios.get(endpoints().farmerProducts.get_product),

  // getProduct: (productId) => axios.get(`${BASE_URL}/products/${productId}/`),
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

    return axios.post(endpoints().farmerProducts.create_product, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
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

    return axios.put(
      `${endpoints().farmerProducts.update_product}/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  deleteProduct: (productId) => {
    return axios.delete(`${endpoints().farmerProducts.delete_product}/${productId}`);
  },

  restockProduct: (productId, quantityData) => {
    return axios.put(
      `${endpoints().farmerProducts.update_product}/${productId}`,
      quantityData
    );
  },

  updateProductStatus: (productId, statusData) => {
    return axios.put(
      `${endpoints().farmerProducts.update_product}/${productId}`,
      statusData
    );
  },
};

export default farmerApi;
