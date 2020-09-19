import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLoad = await AsyncStorage.getItem('@products:car');
      if (productsLoad) {
        setProducts(JSON.parse(productsLoad));
      }
    }

    loadProducts();
  }, []);

  const storagePoject = useCallback(async () => {
    await AsyncStorage.setItem('@products:car', JSON.stringify(products));
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const indexProduct = products.find(item => item.id === product.id);

      if (!indexProduct) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        setProducts(
          products.map(item => {
            return item.id === product.id
              ? {
                  id: item.id,
                  image_url: item.image_url,
                  price: item.price,
                  title: item.title,
                  quantity: item.quantity + 1,
                }
              : item;
          }),
        );
      }

      await storagePoject();
    },
    [products, setProducts, storagePoject],
  );

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const decrement = useCallback(
    async id => {
      const filterProducts = products.filter(product => product.id !== id);
      setProducts(filterProducts);
      await AsyncStorage.setItem(
        '@products:car',
        JSON.stringify(filterProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
