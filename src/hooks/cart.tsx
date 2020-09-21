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

  const addToCart = useCallback(
    async product => {
      const indexProduct = products.find(item => item.id === product.id);
      let newArryProducts = [];
      if (!indexProduct) {
        newArryProducts = [...products, { ...product, quantity: 1 }];
      } else {
        newArryProducts = products.map(item => {
          return item.id === product.id
            ? {
                id: item.id,
                image_url: item.image_url,
                price: item.price,
                title: item.title,
                quantity: item.quantity + 1,
              }
            : item;
        });
      }
      setProducts(newArryProducts);
      await AsyncStorage.setItem(
        '@products:car',
        JSON.stringify(newArryProducts),
      );
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      const filterProducts = products.map(product => {
        if (product.id === id) {
          return {
            id: product.id,
            image_url: product.image_url,
            price: product.price,
            title: product.title,
            quantity: product.quantity + 1,
          };
        }

        return product;
      });
      setProducts(filterProducts);
      await AsyncStorage.setItem(
        '@products:car',
        JSON.stringify(filterProducts),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const filterProducts: Product[] = [];
      products.forEach(product => {
        if (product.id === id && product.quantity > 1) {
          filterProducts.push({
            id: product.id,
            image_url: product.image_url,
            price: product.price,
            title: product.title,
            quantity: product.quantity - 1,
          });
        }
        if (product.id !== id) {
          filterProducts.push(product);
        }
      });

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
