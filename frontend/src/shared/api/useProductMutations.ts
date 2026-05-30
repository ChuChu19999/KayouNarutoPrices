import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';
import { productsApi } from './products';
import type { Product, ProductPayload } from './products';

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Продукт добавлен');
    },
    onError: error => {
      message.error(getApiErrorMessage(error, 'Не удалось добавить продукт'));
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      productsApi.update(id, payload),
    onSuccess: updatedProduct => {
      queryClient.setQueriesData<Product[]>({ queryKey: ['products'] }, old => {
        if (!old) {
          return old;
        }
        return old.map(item => (item.id === updatedProduct.id ? updatedProduct : item));
      });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Продукт обновлён');
    },
    onError: error => {
      message.error(getApiErrorMessage(error, 'Не удалось обновить продукт'));
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Продукт удалён');
    },
    onError: error => {
      message.error(getApiErrorMessage(error, 'Не удалось удалить продукт'));
    },
  });
};
