import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
  name: string;
  quantity: number;
  type: ProductsType;
  price: number;
};

export type Basket = {
  id: string;
  products: Product[];
  totalPrice: number;
};

export const basketApi = {
  calculateTotalPrice: async (
    products: Product[],
    reductionCode?: string
  ): Promise<number> => {
    const response = await apiClient.post<number>("/totalPrice", {
      products,
      reductionCode: reductionCode || "",
    });

    return response.data;
  },

  saveBasket: async (
    products: Product[],
    reductionCode?: string
  ): Promise<Basket> => {
    const response = await apiClient.post<Basket>("/baskets", {
      products,
      reductionCode: reductionCode || "",
    });
    return response.data;
  },

  getBaskets: async (): Promise<Basket[]> => {
    const response = await apiClient.get<Basket[]>("/baskets");
    return response.data;
  },

  deleteBasket: async (id: string): Promise<void> => {
    await apiClient.delete(`/baskets/${id}`);
  },
};
