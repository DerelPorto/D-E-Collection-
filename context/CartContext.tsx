// context/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Definimos cómo se ve un producto en el carrito
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  isAvailable?: boolean;
  availableStock?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Función para validar el estado actual de los artículos del carrito contra la base de datos
  const validateCart = async (currentItems: CartItem[]) => {
    if (currentItems.length === 0) return;
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Fallo al obtener el catálogo de productos");
      const dbProducts: any[] = await res.json();

      setItems(prevItems => {
        let changed = false;
        const validated = prevItems.map(item => {
          // Buscar el producto en la base de datos por ID
          const dbProd = dbProducts.find(p => p.id === item.id);

          if (!dbProd) {
            // El producto ya no existe en el catálogo o no está activo
            if (item.isAvailable !== false) {
              changed = true;
              return { ...item, isAvailable: false, availableStock: 0 };
            }
            return item;
          }

          // Producto activo: validar stock y precio
          const isAvailable = true;
          const availableStock = dbProd.stock;
          const currentPrice = dbProd.price;

          if (
            item.isAvailable !== isAvailable ||
            item.availableStock !== availableStock ||
            item.price !== currentPrice
          ) {
            changed = true;
            return {
              ...item,
              isAvailable,
              availableStock,
              price: currentPrice, // Sincronizar precio si cambió
            };
          }

          return item;
        });

        return changed ? validated : prevItems;
      });
    } catch (error) {
      console.error("Error al validar el estado del carrito:", error);
    }
  };

  // Cargar carrito del LocalStorage al iniciar (para no perder datos si recarga)
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("de-cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
        // Validar stock y disponibilidad inmediatamente al cargar
        validateCart(parsed);
      } catch (e) {
        console.error("Error cargando carrito", e);
      }
    }
  }, []);

  // Validar el carrito cada vez que el usuario lo abre
  useEffect(() => {
    if (isMounted && isCartOpen && items.length > 0) {
      validateCart(items);
    }
  }, [isCartOpen]);

  // Guardar en LocalStorage cada vez que cambia
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("de-cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === newItem.id);

      if (existingItem) {
        // Si ya existe, aumentamos la cantidad
        return currentItems.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Si es nuevo, lo agregamos
      return [...currentItems, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true); // Abrir el carrito automáticamente al agregar
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  // Cálculos automáticos (se excluyen los productos no disponibles)
  const total = items.reduce(
    (sum, item) => sum + (item.isAvailable !== false ? item.price * item.quantity : 0),
    0
  );
  const cartCount = items.reduce(
    (sum, item) => sum + (item.isAvailable !== false ? item.quantity : 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        total,
        cartCount,
        isCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook personalizado para usar el carrito fácil
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
