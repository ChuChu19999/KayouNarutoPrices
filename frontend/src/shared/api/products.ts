import { axiosInstance } from '../config/axios';
import { API_URL } from '../config/process';

export interface Product {
  id: number;
  name: string;
  price: string;
  productUrl: string;
  hasImage: boolean;
  imageUrl: string | null;
}

export interface ProductsFilters {
  search?: string;
}

export type ProductsSortField = 'name' | 'price' | 'id';

export interface ProductsSorting {
  sortBy?: ProductsSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsListParams {
  sortBy?: ProductsSortField;
  sortOrder?: ProductsSorting['sortOrder'];
  search?: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  productUrl: string;
  imageFile?: File;
}

export const getProductImageSrc = (product: Pick<Product, 'id' | 'hasImage' | 'imageUrl'>) => {
  if (!product.hasImage) return undefined;
  if (product.imageUrl?.startsWith('http')) {
    return product.imageUrl;
  }
  const path = product.imageUrl ?? `/api/products/${product.id}/image`;
  return `${API_URL}${path}`;
};

const buildProductFormData = (payload: ProductPayload, requireImage: boolean): FormData => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('price', String(payload.price));
  formData.append('productUrl', payload.productUrl);
  if (payload.imageFile) {
    formData.append('image', payload.imageFile);
  } else if (requireImage) {
    throw new Error('Изображение обязательно');
  }
  return formData;
};

export const productsApi = {
  list: async (params: ProductsListParams): Promise<Product[]> => {
    const { data } = await axiosInstance.get<Product[]>('/api/products/', {
      params: {
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        search: params.search,
      },
    });
    return data;
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const formData = buildProductFormData(payload, true);
    const { data } = await axiosInstance.post<Product>('/api/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, payload: ProductPayload): Promise<Product> => {
    const formData = buildProductFormData(payload, false);
    const { data } = await axiosInstance.patch<Product>(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/products/${id}`);
  },
};
