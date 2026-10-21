import { axios } from "../lib/axios";
import Cookies from "js-cookie";
// import { transactions } from "./Transaction";


import { API_BASE_URL as BASE_URL } from "./config";

export const groupDetails = async (groupId) => {
  try {
    const token = Cookies.get("BIGFARMA_ACCESS_TOKEN");

    const res = await axios.get(`${BASE_URL}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
 

   console.log("Group details:", res.data);
    return res.data;
  } catch (error) {
    console.error("Group details API error:", error.response || error.message);
    throw error;
  }
};
