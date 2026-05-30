import { useQuery } from '@tanstack/react-query';
import { productsApi } from './products';
import type { ProductsFilters, ProductsSorting } from './products';

export interface UseProductsQueryParams {
  filters?: ProductsFilters;
  sorting?: ProductsSorting;
}

export const useProductsQuery = ({ filters, sorting }: UseProductsQueryParams) =>
  useQuery({
    queryKey: ['products', filters, sorting],
    queryFn: () =>
      productsApi.list({
        sortBy: sorting?.sortBy,
        sortOrder: sorting?.sortOrder,
        search: filters?.search,
      }),
    placeholderData: previous => previous,
  });
