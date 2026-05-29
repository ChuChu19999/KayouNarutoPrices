import { create } from 'zustand';
import type { ProductsFilters, ProductsSorting } from '../../api/products';

interface ProductsQueryState {
  page: number;
  pageSize: number;
  filters?: ProductsFilters;
  sorting?: ProductsSorting;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: ProductsFilters | undefined) => void;
  setSorting: (sorting: ProductsSorting | undefined) => void;
  reset: () => void;
}

export const DEFAULT_PRODUCTS_SORTING: ProductsSorting = {
  sortBy: 'name',
  sortOrder: 'asc',
};

const defaultState = {
  page: 1,
  pageSize: 20,
  filters: undefined as ProductsFilters | undefined,
  sorting: DEFAULT_PRODUCTS_SORTING,
};

export const useProductsQueryStore = create<ProductsQueryState>(set => ({
  ...defaultState,
  setPage: page => set({ page }),
  setPageSize: pageSize => set({ pageSize, page: 1 }),
  setFilters: filters => set({ filters, page: 1 }),
  setSorting: sorting => set({ sorting: sorting ?? DEFAULT_PRODUCTS_SORTING, page: 1 }),
  reset: () => set(defaultState),
}));
