import { axios } from "../lib/axios";
import Cookies from "js-cookie";
// import { transactions } from "./Transaction";


const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const walletApi = async () => {
  try {
    const token = Cookies.get("BIGFARMA_ACCESS_TOKEN");

    const res = await axios.get(`${BASE_URL}/wallet/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
 

    console.log("Wallet response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Wallet API error:", error.response || error.message);
    throw error; 
  }
};