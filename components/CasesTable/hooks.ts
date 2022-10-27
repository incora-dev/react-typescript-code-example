import React from 'react';
import { sortItemsByProp } from '@app/utils/helpers';
import { SortingDirection } from '@app/constants/global';
import { ICase } from '@app/constants/case';

type GetValueForSort = (item: ICase) => string | number | undefined;

interface IUseCasesSortingParams {
  items: ICase[];
  initSorting: [string, SortingDirection, GetValueForSort?];
}

interface IUseCasesSortingReturn {
  sortedItems: ICase[];
  getSortingFor: (propName: string) => SortingDirection | undefined;
  onSortingFactory: (
    propName: string,
    initialValue?: SortingDirection,
    getter?: GetValueForSort
  ) => () => void;
}

export const useCasesSorting = ({
  items,
  initSorting,
}: IUseCasesSortingParams): IUseCasesSortingReturn => {
  const [[sortPropName, sortDirection, getValue], setSorting] =
    React.useState<[string, SortingDirection, GetValueForSort?]>(initSorting);

  const getSortingFor = (propName: string) =>
    sortPropName === propName ? sortDirection : undefined;
  const onSortingFactory =
    (
      propName: string,
      initialValue = SortingDirection.DESC,
      getColumnValue?: GetValueForSort
    ) =>
    () => {
      const currentValue = getSortingFor(propName);
      const nextValue =
        currentValue === undefined
          ? initialValue
          : currentValue === SortingDirection.ASC
          ? SortingDirection.DESC
          : SortingDirection.ASC;
      setSorting([propName, nextValue, getColumnValue]);
    };

  const sortedItems = sortItemsByProp(
    items,
    sortPropName,
    sortDirection,
    getValue
  );

  return { sortedItems, getSortingFor, onSortingFactory };
};
