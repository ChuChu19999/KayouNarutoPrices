import { useQuery } from '@tanstack/react-query';
import { productsApi } from './products';
import type { ProductsFilters, ProductsSorting } from './products';

export interface UseProductsQueryParams {
  page: number;
  pageSize: number;
  filters?: ProductsFilters;
  sorting?: ProductsSorting;
}

export const useProductsQuery = ({ page, pageSize, filters, sorting }: UseProductsQueryParams) =>
  useQuery({
    queryKey: ['products', page, pageSize, filters, sorting],
    queryFn: () =>
      productsApi.list({
        page,
        pageSize,
        sortBy: sorting?.sortBy,
        sortOrder: sorting?.sortOrder,
        search: filters?.search,
      }),
    placeholderData: previous => previous,
  });
