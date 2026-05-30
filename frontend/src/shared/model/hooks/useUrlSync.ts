import React, { useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  filtersToUrlParams,
  urlParamsToFilters,
  getSortingFromUrl,
  updateUrlParams,
} from '../../lib/urlParams';

export interface UseUrlSyncOptions {
  filterKeys: string[];
}

/**
 * Хук для синхронизации store с URL параметрами
 */
export function useUrlSync<TFilters extends Record<string, unknown> = Record<string, unknown>>(
  options: UseUrlSyncOptions,
  storeState: {
    filters?: TFilters;
    sorting?: { sort_by?: string; sort_order?: 'asc' | 'desc' };
  },
  storeActions: {
    setFilters: (filters: TFilters | undefined) => void;
    setSorting: (sorting: { sort_by?: string; sort_order?: 'asc' | 'desc' } | undefined) => void;
  }
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { filterKeys } = options;
  const previousPathRef = useRef<string | undefined>(undefined);
  const isInitialMountRef = useRef(true);
  const isResettingRef = useRef(false);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousPathRef.current = location.pathname;
      return;
    }

    if (previousPathRef.current !== undefined && previousPathRef.current !== location.pathname) {
      isResettingRef.current = true;

      if (searchParams.toString()) {
        const newParams = new URLSearchParams();
        setSearchParams(newParams, { replace: true });
      }

      storeActions.setFilters(undefined);
      storeActions.setSorting(undefined);

      setTimeout(() => {
        isResettingRef.current = false;
      }, 100);
    }

    previousPathRef.current = location.pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, setSearchParams, storeActions]);

  useEffect(() => {
    if (isResettingRef.current) {
      return;
    }

    const urlFilters = urlParamsToFilters(searchParams, filterKeys) as TFilters;
    const urlSorting = getSortingFromUrl(searchParams);

    if (searchParams.toString()) {
      const hasUrlFilters = Object.keys(urlFilters).length > 0;
      const hasStoreFilters = storeState.filters && Object.keys(storeState.filters).length > 0;
      if (hasUrlFilters && JSON.stringify(urlFilters) !== JSON.stringify(storeState.filters)) {
        storeActions.setFilters(urlFilters);
      } else if (!hasUrlFilters && hasStoreFilters) {
        // URL пустой при первой загрузке — store не трогаем
      }
      if (urlSorting.sort_by) {
        if (
          urlSorting.sort_by !== storeState.sorting?.sort_by ||
          urlSorting.sort_order !== storeState.sorting?.sort_order
        ) {
          storeActions.setSorting(urlSorting);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isResettingRef.current) {
      return;
    }

    const urlUpdates: Record<string, string | number | undefined> = {
      sortBy: storeState.sorting?.sort_by,
      sortOrder: storeState.sorting?.sort_order,
    };

    if (storeState.filters) {
      const filterParams = filtersToUrlParams(storeState.filters);
      Object.assign(urlUpdates, filterParams);
    }

    filterKeys.forEach(key => {
      if (!storeState.filters || !storeState.filters[key]) {
        urlUpdates[key] = undefined;
      }
    });

    const newParams = updateUrlParams(searchParams, urlUpdates);

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [storeState, searchParams, setSearchParams, filterKeys]);

  const setFilters = useCallback(
    (filters: TFilters | undefined) => {
      storeActions.setFilters(filters);
    },
    [storeActions]
  );

  const setSorting = useCallback(
    (sorting: { sort_by?: string; sort_order?: 'asc' | 'desc' } | undefined) => {
      storeActions.setSorting(sorting);
    },
    [storeActions]
  );

  return {
    setFilters,
    setSorting,
  };
}
