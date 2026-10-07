import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";
import api from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // GET /api/wishlist
  const loadWishlist = useCallback(async () => {
    try {
      const response = await api.get("/wishlist");

      setWishlist(response.data.data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);

      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/wishlist/:bookId
  const addToWishlist = useCallback(
    async (bookId) => {
      try {
        await api.post(`/wishlist/${bookId}`);

        await loadWishlist();

        return true;
      } catch (error) {
        console.error("Error adding to wishlist:", error);

        return false;
      }
    },
    [loadWishlist],
  );

  // DELETE /api/wishlist/:bookId
  const removeFromWishlist = useCallback(
    async (bookId) => {
      try {
        await api.delete(`/wishlist/${bookId}`);

        await loadWishlist();

        return true;
      } catch (error) {
        console.error("Error removing from wishlist:", error);

        return false;
      }
    },
    [loadWishlist],
  );

  // Check whether a book exists in wishlist
  const isInWishlist = useCallback(
    (bookId) => {
      return wishlist.some((book) => Number(book.id) === Number(bookId));
    },
    [wishlist],
  );

  // Load wishlist once
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [isAuthenticated, loadWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        loadWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}