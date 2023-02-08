import { useState } from 'react';

import { useQuery } from 'react-query';
// components
import Item from './item/Item';
import Cart from './cart/Cart';
import Drawer from '@material-ui/core/Drawer';
import { LinearProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { AddShoppingCart } from '@material-ui/icons';
import Badge from '@material-ui/core/Badge';
// styles
import { Wrapper, StyledButton } from './App.styles';

// Types
export type CartItemType = {
  category: string;
  description: string;
  id: number;
  image: string;
  price: number;
  title: string;
  amount: number;
};

const getProducts = async (): Promise<CartItemType[]> =>
  await (await fetch(`https://fakestoreapi.com/products`)).json();

function App() {
  // states
  const [cartOpen, setCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState([] as CartItemType[]);

  // react query, extracting data, is loading and error
  const { data, isLoading, error } = useQuery<CartItemType[]>(
    'products',
    getProducts
  );

  const getTotalItems = (items: CartItemType[]) =>
    items.reduce((acc: number, item) => acc + item.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems((prev) => {
      // 1. Is the item already added in the cart?
      const isItemInCart = prev.find((item) => item.id === clickedItem.id);

      if (isItemInCart) {
        return prev.map((item) =>
          item.id === clickedItem.id
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }
      // First time the item is added
      return [...prev, { ...clickedItem, amount: 1 }];
    });
  };
  const handleRemoveFromCart = (id: number) => {
    setCartItems((prev) =>
      prev.reduce((acc, item) => {
        if (item.id === id) {
          if (item.amount === 1) return acc;
          return [...acc, { ...item, amount: item.amount - 1 }];
        } else {
          return [...acc, item];
        }
      }, [] as CartItemType[])
    );
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <div>Something went wrong...</div>;

  return (
    <Wrapper>
      <Drawer anchor='right' open={cartOpen} onClose={() => setCartOpen(false)}>
        <Cart
          cartItems={cartItems}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart}
        />
      </Drawer>
      <StyledButton onClick={() => setCartOpen(true)}>
        <Badge
          overlap='rectangular'
          badgeContent={getTotalItems(cartItems)}
          color='error'
        >
          <AddShoppingCart />
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
        {data?.map((item) => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
}

export default App;
