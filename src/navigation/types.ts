export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ProductSearch: { initialQuery?: string } | undefined;
  ProductDetail: { productId: number };
  ShoppingList: undefined;
  ShoppingListComparison: undefined;
  NearbyEstablishments: undefined;
  ReceiptCapture: undefined;
  NewPurchase: undefined;
  PurchaseHistory: undefined;
  PurchaseDetail: { purchaseId: number };
};

export type ProductsStackParamList = {
  ProductSearch: { initialQuery?: string } | undefined;
  ProductDetail: { productId: number };
};

export type ShoppingListStackParamList = {
  ShoppingList: undefined;
  ShoppingListComparison: undefined;
  ProductDetail: { productId: number };
};

export type ProfileStackParamList = {
  Profile: undefined;
  PurchaseHistory: undefined;
  PurchaseDetail: { purchaseId: number };
  NewPurchase: undefined;
};

export type AppTabParamList = {
  HomeTab: undefined;
  ProductsTab: undefined;
  ShoppingListTab: undefined;
  ProfileTab: undefined;
};
