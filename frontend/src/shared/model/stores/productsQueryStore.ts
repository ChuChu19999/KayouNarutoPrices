import { create } from 'zustand';
import type { ProductsFilters, ProductsSorting } from '../../api/products';

interface ProductsQueryState {
  filters?: ProductsFilters;
  sorting?: ProductsSorting;
  setFilters: (filters: ProductsFilters | undefined) => void;
  setSorting: (sorting: ProductsSorting | undefined) => void;
  reset: () => void;
}

export const DEFAULT_PRODUCTS_SORTING: ProductsSorting = {
  sortBy: 'name',
  sortOrder: 'asc',
};

const defaultState = {
  filters: undefined as ProductsFilters | undefined,
  sorting: DEFAULT_PRODUCTS_SORTING,
};

export const useProductsQueryStore = create<ProductsQueryState>(set => ({
  ...defaultState,
  setFilters: filters => set({ filters }),
  setSorting: sorting => set({ sorting: sorting ?? DEFAULT_PRODUCTS_SORTING }),
  reset: () => set(defaultState),
}));
