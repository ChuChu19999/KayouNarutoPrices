import { useCallback, useState } from 'react';
import { Button, Input } from 'antd';
import { Helmet } from 'react-helmet';
import { BiPlus } from 'react-icons/bi';
import { ResetFiltersButton } from '../../entities/ResetFiltersButton';
import { ProductFormModal, type ProductFormMode } from '../../features/ProductForm';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from '../../shared/api';
import { useUrlSync } from '../../shared/model/hooks/useUrlSync';
import { useProductsQueryStore } from '../../shared/model/stores';
import { ProductsTable } from '../../widgets/ProductsTable';
import type { Product, ProductPayload } from '../../shared/api';
import './PricesPage.css';

const PricesPage = () => {
  const { page, pageSize, filters, sorting, setPage, setPageSize, setFilters, setSorting } =
    useProductsQueryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ProductFormMode>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  useUrlSync(
    { filterKeys: ['search'], defaultPage: 1, defaultPageSize: 20 },
    {
      page,
      pageSize,
      filters: filters as Record<string, unknown> | undefined,
      sorting: sorting ? { sort_by: sorting.sortBy, sort_order: sorting.sortOrder } : undefined,
    },
    {
      setPage,
      setPageSize,
      setFilters: value => {
        if (!value) {
          setFilters(undefined);
          return;
        }
        const raw = value as { search?: string };
        setFilters({
          search: typeof raw.search === 'string' ? raw.search : undefined,
        });
      },
      setSorting: value => {
        if (!value?.sort_by) {
          setSorting(undefined);
          return;
        }
        setSorting({
          sortBy: value.sort_by as 'name' | 'price' | 'id',
          sortOrder: value.sort_order,
        });
      },
    }
  );

  const { data, isLoading, isFetching, error } = useProductsQuery({
    page,
    pageSize,
    filters,
    sorting,
  });

  const handleReset = useCallback(() => {
    setFilters(undefined);
    setSorting(undefined);
    setPage(1);
  }, [setFilters, setSorting, setPage]);

  const openCreateModal = useCallback(() => {
    setModalMode('create');
    setEditingProduct(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleFormSubmit = useCallback(
    (payload: ProductPayload) => {
      if (modalMode === 'create') {
        createMutation.mutate(payload, {
          onSuccess: () => closeModal(),
        });
        return;
      }
      if (!editingProduct) return;
      updateMutation.mutate(
        { id: editingProduct.id, payload },
        {
          onSuccess: () => closeModal(),
        }
      );
    },
    [modalMode, editingProduct, createMutation, updateMutation, closeModal]
  );

  const handleDelete = useCallback(
    (product: Product) => {
      setDeletingId(product.id);
      deleteMutation.mutate(product.id, {
        onSuccess: () => {
          if (editingProduct?.id === product.id) {
            closeModal();
          }
        },
        onSettled: () => setDeletingId(null),
      });
    },
    [deleteMutation, editingProduct, closeModal]
  );

  const formLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="prices-page">
      <Helmet>
        <title>Kayou Naruto — каталог цен</title>
      </Helmet>

      <header className="prices-page__header">
        <h1 className="prices-page__title">Kayou Naruto</h1>
        <p className="prices-page__subtitle">Каталог цен на карточные продукты</p>
      </header>

      <main className="prices-page__main">
        <section className="prices-page__panel">
          <h2 className="prices-page__panel-title">Каталог</h2>

          <div className="prices-page__toolbar">
            <div className="prices-page__search-wrap">
              <label className="prices-page__label" htmlFor="product-search">
                Поиск
              </label>
              <Input.Search
                id="product-search"
                allowClear
                placeholder="Поиск по наименованию"
                className="prices-page__search"
                defaultValue={filters?.search}
                onSearch={value =>
                  setFilters({
                    search: value.trim() || undefined,
                  })
                }
              />
            </div>
            <div className="prices-page__toolbar-actions">
              <Button
                type="primary"
                icon={<BiPlus size={18} />}
                className="prices-page__add"
                onClick={openCreateModal}
              >
                Добавить
              </Button>
              <ResetFiltersButton onReset={handleReset} className="prices-page__reset" />
            </div>
          </div>

          {error ? (
            <p className="prices-page__error">
              Не удалось загрузить каталог. Проверьте API и базу данных.
            </p>
          ) : (
            <ProductsTable
              items={data?.items ?? []}
              total={data?.total ?? 0}
              page={page}
              pageSize={pageSize}
              loading={isLoading || isFetching}
              sortBy={sorting?.sortBy}
              sortOrder={sorting?.sortOrder}
              deleteLoadingId={deletingId}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onSortChange={(sortBy, sortOrder) =>
                setSorting({ sortBy: sortBy as 'name' | 'price' | 'id', sortOrder })
              }
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>

      <ProductFormModal
        open={modalOpen}
        mode={modalMode}
        product={editingProduct}
        loading={formLoading}
        onCancel={closeModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PricesPage;
