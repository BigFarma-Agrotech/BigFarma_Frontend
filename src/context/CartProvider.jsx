import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import { canOrder, clampQuantity, getOrderRules } from "@/lib/units";

const STORAGE_KEY = "BIGFARMA_CART";

// Read the saved cart synchronously so the first render can't overwrite it
const loadCart = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing cart from localStorage:", error);
    return [];
  }
};

// The price a buyer pays: the discounted price when the product has one
const getUnitPrice = (product) =>
  Number(product?.discounted_price || product?.price || 0);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  // Quantities always respect the product's minimum order and stock; leaving
  // `quantity` out adds the minimum
  const addToCart = (product, quantity) => {
    const rules = getOrderRules(product);
    const amount = quantity ?? rules.min;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: clampQuantity(item.cartQuantity + amount, rules) }
            : item
        );
      }
      return [
        ...prevItems,
        {
          ...product,
          original_price: Number(product.price || 0),
          price: getUnitPrice(product),
          cartQuantity: clampQuantity(amount, rules),
        },
      ];
    });
  };

  // Bring cart items up to date with the latest products (stock, price,
  // availability), fitting quantities to what's now in stock
  const refreshProducts = (products) => {
    const latest = new Map((products || []).map((p) => [p.id, p]));
    setCartItems((prevItems) => {
      let changed = false;
      const next = prevItems.map((item) => {
        const product = latest.get(item.id);
        if (!product) return item;
        const merged = {
          ...item,
          quantity: product.quantity,
          unit: product.unit,
          min_order_quantity: product.min_order_quantity,
          availability: product.availability,
          is_listed: product.is_listed,
          original_price: Number(product.price || 0),
          price: getUnitPrice(product),
        };
        const rules = getOrderRules(merged);
        merged.cartQuantity = canOrder(rules) ? clampQuantity(item.cartQuantity, rules) : item.cartQuantity;
        const keys = ["quantity", "unit", "min_order_quantity", "availability", "is_listed", "price", "cartQuantity"];
        if (keys.some((key) => merged[key] !== item[key])) changed = true;
        return merged;
      });
      return changed ? next : prevItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, cartQuantity: clampQuantity(quantity, getOrderRules(item)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Number of products: quantities in different units (kg, bags) can't be added up
  const getCartCount = () => cartItems.length;

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price || 0) * item.cartQuantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        refreshProducts,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
