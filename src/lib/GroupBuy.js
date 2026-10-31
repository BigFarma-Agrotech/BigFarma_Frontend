// Sample groups used when the /groups API is unavailable. Field names differ
// from the API shape; see normalizeGroup() in ./groupBuyApi.js.
import Tomatoes from "/productImages/tomatoes.webp";
import Pepper from "/productImages/pepper.webp";
import Plantain from "/productImages/plantain.webp";
import Onions from "/productImages/onions.png";
import Egg from '/productImages/Crate of eggs.webp';
import Melon from '/productImages/melon.webp';


export const GroupData = [
    {id: 1, name: "Tomatoes", image: Tomatoes,status: "AlmostFull", location: "Kano", product: "Tomatoes", category: "Vegetable", total: 100, price: 2000, slotTaken: 8, slot: 10,  },
    {id:2,name: "Pepper", image: Pepper,status: "AlmostFull", location: "Jos", product: "Pepper", category: "Vegetable", total: 100, price: 5000, slotTaken: 15, slot: 20,  },
    {id:3,name: "Plantain", image: Plantain,status: "Complete", location: "Lagos", product: "Plantain", category: "Fruits", total: 100, price: 8000, slotTaken: 15, slot: 15,  },
    {id:4,name: "Onions", image: Onions,status: "AlmostFull", location: "Abuja", product: "Onions", category: "Vegetable", total: 100, price: 8000, slotTaken: 10, slot: 25,  },
    {id:5,name: "Egg",  image: Egg,status: "Complete", location: "Cross River", product: "Egg", category: "Livestock", total: 100, price: 8000, slotTaken: 3, slot: 15,  },
    {id:6,name: "Melon",  image: Melon,status: "AlmostFull", location: "Cross River", product: "Melon", category: "Nuts", total: 100, price: 8000, slotTaken: 25, slot: 30,  }
   
]