import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Pagination, Popconfirm, Spin } from 'antd';
import { BiDownArrow, BiEdit, BiTrash, BiUpArrow } from 'react-icons/bi';
import { getProductImageSrc } from '../../../shared/api/products';
import type { Product } from '../../../shared/api/products';
import './ProductsTable.css';

const columnHelper = createColumnHelper<Product>();

interface ProductsTableProps {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  deleteLoadingId?: number | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const formatPrice = (value: string) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(num);
};

const sortableColumns: Record<string, string> = {
  name: 'name',
  price: 'price',
};

export const ProductsTable = ({
  items,
  total,
  page,
  pageSize,
  loading,
  sortBy,
  sortOrder,
  deleteLoadingId,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEdit,
  onDelete,
}: ProductsTableProps) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'image',
        header: 'Изображение',
        cell: info => {
          const src = getProductImageSrc(info.row.original);
          if (!src) {
            return <span className="products-table__no-image">—</span>;
          }
          return (
            <img
              src={src}
              alt={info.row.original.name}
              className="products-table__image"
              loading="lazy"
            />
          );
        },
      }),
      columnHelper.accessor('name', {
        header: 'Наименование',
        cell: info => <span className="products-table__name-badge">{info.getValue()}</span>,
      }),
      columnHelper.accessor('price', {
        header: 'Цена',
        cell: info => (
          <a
            href={info.row.original.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="products-table__price-link"
            title="Открыть страницу продукта"
          >
            {formatPrice(info.getValue())}
          </a>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Действия',
        cell: info => {
          const product = info.row.original;
          const isDeleting = deleteLoadingId === product.id;
          return (
            <div className="products-table__actions">
              <button
                type="button"
                className="products-table__action-btn"
                title="Редактировать"
                onClick={() => onEdit(product)}
              >
                <BiEdit size={18} />
              </button>
              <Popconfirm
                title="Удалить продукт?"
                description="Запись будет удалена из базы без возможности восстановления."
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true, loading: isDeleting }}
                onConfirm={() => onDelete(product)}
              >
                <button
                  type="button"
                  className="products-table__action-btn products-table__action-btn--danger"
                  title="Удалить"
                  disabled={isDeleting}
                >
                  <BiTrash size={18} />
                </button>
              </Popconfirm>
            </div>
          );
        },
      }),
    ],
    [deleteLoadingId, onEdit, onDelete]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const toggleSort = (columnId: string) => {
    if (!sortableColumns[columnId]) return;
    if (sortBy !== columnId) {
      onSortChange(columnId, 'asc');
      return;
    }
    onSortChange(columnId, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderSortIcon = (columnId: string) => {
    if (sortBy !== columnId) return null;
    return sortOrder === 'asc' ? <BiUpArrow size={14} /> : <BiDownArrow size={14} />;
  };

  return (
    <div className="products-table">
      <Spin spinning={loading}>
        <div className="products-table__scroll">
          <table className="products-table__native">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const columnId = header.column.id;
                    const isSortable = Boolean(sortableColumns[columnId]);
                    return (
                      <th key={header.id}>
                        {isSortable ? (
                          <button
                            type="button"
                            className="products-table__sort-btn"
                            onClick={() => toggleSort(columnId)}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {renderSortIcon(columnId)}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="products-table__empty">
                    Нет продуктов в каталоге
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Spin>
      <div className="products-table__pagination">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          showTotal={t => `Всего: ${t}`}
          onChange={(p, ps) => {
            if (ps !== pageSize) onPageSizeChange(ps);
            else onPageChange(p);
          }}
        />
      </div>
    </div>
  );
};
