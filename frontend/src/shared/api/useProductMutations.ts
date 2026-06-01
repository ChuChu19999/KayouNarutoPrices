import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { getApiErrorMessage } from '../lib/getApiErrorMessage';
import { productsApi } from './products';
import type { ProductPayload } from './products';

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Товар добавлен');
    },
    onError: error => {
      message.error(getApiErrorMessage(error, 'Не удалось добавить товар'));
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Товар обновлён');
    },
    onError: error => {
      message.error(getApiErrorMessage(error, 'Не удалось обновить товар'));
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Товар удалён');
    },
    onError: error => {
      message.error(getApiErrorMessage(error, 'Не удалось удалить товар'));
    },
  });
};
