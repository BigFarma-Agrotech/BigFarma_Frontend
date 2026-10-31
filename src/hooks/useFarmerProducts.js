// src/hooks/useFarmerProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { farmerApi } from '../lib/farmerApi';

// Fetch all farmer products
export const useFarmerProducts = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ['farmerProducts'],
    enabled,
    queryFn: async () => {
      try {
        const response = await farmerApi.getProducts();
        return response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        const friendly = new Error(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            'Failed to fetch products'
        );
        // Keep the status so the retry rule can tell a 401 from a server error
        friendly.response = error.response;
        throw friendly;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single product
export const useFarmerProduct = (productId) => {
  return useQuery({
    queryKey: ['farmerProduct', productId],
    queryFn: async () => {
      try {
        const response = await farmerApi.getProduct(productId);
        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.detail || 'Failed to fetch product details'
        );
      }
    },
    enabled: !!productId, // Only run if productId exists
  });
};

// Create new product
export const useCreateFarmerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      const response = await farmerApi.createProduct(productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

// Update product
export const useUpdateFarmerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, productData }) => {
      const response = await farmerApi.updateProduct(productId, productData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate both the list and the specific product
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['farmerProduct', variables.productId] });
    },
  });
};

// Delete product
export const useDeleteFarmerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => {
      const response = await farmerApi.deleteProduct(productId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });
};

// Restock product
export const useRestockFarmerProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await farmerApi.restockProduct(productId, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });
};

// Update product status
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, status }) => {
      const response = await farmerApi.updateProductStatus(productId, {
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerProducts'] });
    },
  });
};
