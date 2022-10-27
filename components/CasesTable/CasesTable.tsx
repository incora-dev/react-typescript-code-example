import React, { useContext } from 'react';
import AutoSizer, {
  Size as AutoSizerChildComponentProps,
} from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import cn from 'classnames';
import { NonIdealState, Callout, Button, Icon } from '@blueprintjs/core';
import { CSSTransition } from 'react-transition-group';
import SortedTableHeadCell from '@app/components/ui/SortedTableHeadCell';
import { getCasesData } from '@app/utils/mockData';
import { SortingDirection, tableRowHeight } from '@app/constants/global';
import { useCasesSorting } from './hooks';
import { getCaseSeverityNumber } from '@app/modules/cases/utils';
import { ICase } from '@app/constants/case';
import CasesTableRow, {
  ShowingRowsProps,
} from '@app/components/ui/CasesTable/CasesTableRow';
import { getCaseSearchFilter } from '@app/modules/cases';
import { SearchContext } from '@app/components/context/SearchContext';
import './CasesTable.scss';

interface ICasesTableProps {
  items: Record<string, ICase>;
  loading?: boolean;
  goToCasePage: (caseId: string) => void;
  showRows: ShowingRowsProps;
}

const CasesTable: React.FC<ICasesTableProps> = (props) => {
  const showRows = props.showRows;

  const itemsArr = Object.values(props.items);
  const items = showRows.areCasesLoading ? getCasesData() : itemsArr;
  const { searchValue, setSearchValue } = useContext(SearchContext);

  const { sortedItems, getSortingFor, onSortingFactory } = useCasesSorting({
    items: searchValue ? items.filter(getCaseSearchFilter(searchValue)) : items,
    initSorting: showRows.showClinicalSeverity
      ? [
          'hospital.clinicalSeverity',
          SortingDirection.ASC,
          getCaseSeverityNumber,
        ]
      : ['timeLastUpdate', SortingDirection.ASC],
  });
  const emptyState = sortedItems.length === 0;

  const clearSearch = () => {
    setSearchValue('');
  };

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const item = sortedItems[index];
    const oddRowStyle = index % 2 !== 0 ? 'odd' : '';
    return (
      <CasesTableRow
        handleClick={props.goToCasePage}
        key={item.id}
        item={item}
        className={cn('cases-table-row', oddRowStyle)}
        {...showRows}
        style={style}
      />
    );
  };

  const renderFixedSizeList = ({
    height,
    width,
  }: AutoSizerChildComponentProps) => {
    const isOverflowing = height < sortedItems.length * tableRowHeight;
    const tableBordersStyle = isOverflowing ? 'tbody-border' : '';

    return (
      <FixedSizeList
        className={cn('tbody', tableBordersStyle)}
        height={height}
        itemCount={sortedItems.length}
        itemSize={tableRowHeight}
        width={width}>
        {renderRow}
      </FixedSizeList>
    );
  };

  return (
    <div className={cn('cases-table-container', emptyState && 'is-empty')}>
      <CSSTransition
        in={searchValue.length > 0}
        key='callout'
        classNames='callout-transition'
        timeout={100}>
        <Callout className='primary-callout'>
          <div className='primary-callout-container'>
            <div>
              <Icon icon='search-template' iconSize={20} />
              <span className='title'>Search results</span>
            </div>
            <Button text='Done' onClick={clearSearch} />
          </div>
        </Callout>
      </CSSTransition>
      {!emptyState ? (
        <>
          <div className='thead'>
            {showRows.showStatus && (
              <SortedTableHeadCell
                name='Status'
                sorting={getSortingFor('status')}
                onSorting={onSortingFactory('status', SortingDirection.ASC)}
                className='w-100'
              />
            )}
            {showRows.showBedNumber && (
              <SortedTableHeadCell
                name='Bed'
                sorting={getSortingFor('hospital.bed')}
                onSorting={onSortingFactory(
                  'hospital.bed',
                  SortingDirection.ASC
                )}
                className='w-110'
              />
            )}
            {showRows.showCaseNumber && (
              <SortedTableHeadCell
                name='Case number'
                sorting={getSortingFor('number')}
                onSorting={onSortingFactory('number')}
                className='w-150 cases-table-row-case-number'
              />
            )}
            {showRows.showFullName && (
              <SortedTableHeadCell
                name={showRows.showPatientColumn ? 'Patient' : 'Name'}
                sorting={getSortingFor('patient.lastName')}
                onSorting={onSortingFactory('patient.lastName')}
                className='mw-150 flex-1 cases-table-row-fullname'
              />
            )}
            {!showRows.showFullName && (
              <SortedTableHeadCell
                name='First name'
                sorting={getSortingFor('patient.firstName')}
                onSorting={onSortingFactory('patient.firstName')}
                className='mw-150 flex-1'
              />
            )}
            {!showRows.showFullName && (
              <SortedTableHeadCell
                name='Last name'
                sorting={getSortingFor('patient.lastName')}
                onSorting={onSortingFactory('patient.lastName')}
                className='mw-150 flex-1'
              />
            )}
            {showRows.showCreators && (
              <SortedTableHeadCell
                name='Creator'
                sorting={getSortingFor('createdByName')}
                onSorting={onSortingFactory('createdByName')}
                className='mw-150 flex-1'
              />
            )}
            {showRows.showAdmissionDate && (
              <SortedTableHeadCell
                name='Admission Date'
                sorting={getSortingFor('hospital.admissionDate')}
                onSorting={onSortingFactory(
                  'hospital.admissionDate',
                  SortingDirection.ASC
                )}
                className='w-150'
              />
            )}
            {
              <SortedTableHeadCell
                name='Last Update'
                sorting={getSortingFor('timeLastUpdate')}
                onSorting={onSortingFactory(
                  'timeLastUpdate',
                  SortingDirection.ASC
                )}
                className='w-200 cases-table-row-update'
              />
            }
          </div>
          <div
            className={cn('tbody-container', {
              ['search-active']: !!searchValue.length,
            })}>
            <AutoSizer>{renderFixedSizeList}</AutoSizer>
          </div>
        </>
      ) : (
        <NonIdealState icon='disable' title='No cases' />
      )}
    </div>
  );
};

export default React.memo(CasesTable);
