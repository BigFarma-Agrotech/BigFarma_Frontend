import { User } from 'lucide-react';
export const endpoints = () => {
  return {
    auth: {
      password_reset: `/auth/password-reset`,
      register: `/auth/register`,
      requestCode: `/auth/request-otp`,
      verify_otp: `/auth/verify-otp`,
      login: `/auth/login`,
      change_default_password: `/auth/change-default-password`,
      forgot_password: `/auth/forgot-password`,
      reset_password_request: `/auth/request-otp`,
      validateOtp: `/auth/validate-otp`,
      resend_otp: `/auth/resend-otp`,
    },
    users: {
      profile: `/users/profile`,
      get_farmer_profile: `/users/farmer-profile`,
      get_consumer_profile: `/users/consumer-profile`,
      create_farmer_profile: `/users/farmer-profile`,
      create_consumer_profile: `/users/consumer-profile`,
      update_farmer_profile: `/users/farmer-profile`,
      update_consumer_profile: `/users/consumer-profile`,
      delete_farmer_profile: `/users/farmer-profile`,
      delete_consumer_profile: `/users/consumer-profile`,
    },
    consumer: {
      orders: `/orders`,
    },
    groupBuy: {
      list: `/groups`,
    },
    farmerProducts: {
      create_product: `marketplace/farmers/products`,
      get_product: `marketplace/farmers/products`,
      update_product: `marketplace/farmers/products`,
      delete_product: `marketplace/farmers/products`,
    },
    farmerOrders: {
      orders: `/orders`,
      farmer_orders: `/orders/farmer/orders`,
      update_order_status: `/orders`,
    },
    wallet: {
      wallet: `/wallet`,
      dashboard: `/wallet/dashboard`,
      // withdraw: `/wallet/withdraw`,
    },
  };
};
