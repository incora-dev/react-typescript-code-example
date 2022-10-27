import React, { CSSProperties } from 'react';
import cn from 'classnames';
import TimeAgo from 'react-timeago';
import BedIcon from '@app/resources/icons/bed-badge.svg';
import { differenceInHours } from 'date-fns';
import { Tag } from '@blueprintjs/core';
import { Tooltip2 as Tooltip } from '@blueprintjs/popover2';
import { Intent, Classes as BpClasses } from '@blueprintjs/core';
import { getNextTruthyCaseTiming } from '@app/modules/cases';
import { getCaseClinicalSeverityTag } from '@app/components/common/helpers';
import { timeAgoFormatter } from '@app/modules/layout';
import { formatDateTime } from '@app/utils/dateUtils';
import { ICase, CaseStatus } from '@app/constants/case';
import { IPatient } from '@app/constants/patient';
import './CasesTableRow.scss';

type ShownRows =
  | 'showCreators'
  | 'areCasesLoading'
  | 'showStatus'
  | 'showFullName'
  | 'showBedNumber'
  | 'showAdmissionDate'
  | 'showCaseNumber'
  | 'showPatientColumn';

export type ShowingRowsProps = Partial<Record<ShownRows, boolean>>;

interface ICasesTableRowProps extends ShowingRowsProps {
  item: ICase;
  className?: string;
  handleClick?: (caseId: string) => void;
  style: CSSProperties;
}

interface ICasesTableRowState {
  isFlashed: boolean;
}

class CasesTableRow extends React.Component<
  ICasesTableRowProps,
  ICasesTableRowState
> {
  static flashDuration = 1000; // 1s
  private timeoutId: number | null = null;

  public state = {
    isFlashed: false,
  };

  public componentDidUpdate(prevProps: ICasesTableRowProps) {
    const item = this.props.item;
    const prevItem = prevProps.item;
    if (item !== prevItem && item.version > prevItem.version) {
      // Item was updated
      if (item.sessionLastUpdate) {
        // Item was updated by other session
        this.setState((state) => {
          if (state.isFlashed) return state;
          this.timeoutId = window.setTimeout(() => {
            this.setState({ isFlashed: false });
          }, CasesTableRow.flashDuration);
          return { ...state, isFlashed: true };
        });
      }
    }
  }

  public componentWillUnmount() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  private cellRenderer = {
    status: cellRendererFactory('status'),
    bed: cellRendererFactory('bed'),
    admissionDate: cellRendererFactory('admissionDate', { format: formatDate }),
    number: cellRendererFactory('number'),
    firstName: cellRendererFactory('firstName'),
    lastName: cellRendererFactory('lastName'),
    fullName: cellRendererFactory('fullName', {
      format: formatPatientFullName,
    }),
    timeLastUpdate: cellRendererFactory('timeLastUpdate', {
      format: formatDate,
    }),
    createdByName: cellRendererFactory('createdByName'),
  };

  public render() {
    const props = this.props;
    const {
      item,
      showStatus,
      showCreators,
      showFullName,
      showAdmissionDate,
      areCasesLoading,
      showCaseNumber,
      showBedNumber,
    } = props;
    const cellRenderer = this.cellRenderer;
    const now = new Date();

    return (
      <div
        onClick={() => {
          if (this.props.handleClick && !this.props.areCasesLoading) {
            this.props?.handleClick(item.id);
          }
        }}
        data-id={item.id}
        className={cn(
          this.state.isFlashed && 'is-flashed',
          props.className,
          'tr'
        )}
        style={props.style}>
        {showStatus && (
          <div className='td cases-table-row-status w-100'>
            {getStatusTag(item, now, areCasesLoading)}
          </div>
        )}
        {showBedNumber && (
          <div
            className={cn(
              'cases-table-row-bed',
              { 'no-assigned-bed': !item.hospital?.bed },
              'w-110',
              'td'
            )}>
            {item.hospital?.bed && <BedIcon className='td bed-icon' />}
            {cellRenderer.bed(item.hospital?.bed, areCasesLoading)}
          </div>
        )}
        {showCaseNumber && (
          <div className='td text-monospace w-150 cases-table-row-case-number'>
            {cellRenderer.number(item.number, areCasesLoading)}
          </div>
        )}
        {showFullName && (
          <div className='td mw-150 flex-1'>
            {cellRenderer.fullName(item.patient, areCasesLoading)}
          </div>
        )}
        {!showFullName && (
          <div className='td mw-150 flex-1'>
            {cellRenderer.firstName(item.patient?.firstName, areCasesLoading)}
          </div>
        )}
        {!showFullName && (
          <div className='td mw-150 flex-1'>
            {cellRenderer.lastName(item.patient?.lastName, areCasesLoading)}
          </div>
        )}
        {showCreators && (
          <div className='td mw-150 flex-1'>
            {cellRenderer.createdByName(item.createdByName, areCasesLoading)}
          </div>
        )}
        {showAdmissionDate && (
          <div className='td w-150'>
            {cellRenderer.admissionDate(
              item.hospital?.admissionDate,
              areCasesLoading
            )}
          </div>
        )}
        <div className='td cases-table-row-update w-200'>
          {cellRenderer.timeLastUpdate(item.timeLastUpdate, areCasesLoading)}
        </div>
      </div>
    );
  }
}

function formatDate(timestamp?: string): React.ReactElement | string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return (
    <Tooltip content={formatDateTime(date)} placement='bottom'>
      <TimeAgo date={date} title='' formatter={timeAgoFormatter} />
    </Tooltip>
  );
}

function formatPatientFullName(patient?: IPatient): string {
  if (!patient) return '';
  const firstName = patient.firstName ?? '';
  const lastName = patient.lastName ?? '';
  return `${firstName} ${lastName}`.trim();
}

function cellRendererFactory<T>(
  placeholder: string,
  options?: { format: (value: T) => React.ReactElement | string }
) {
  return (value: T, areCasesLoading = false) => {
    const { format } = options || {};
    if (areCasesLoading)
      return <span className={BpClasses.SKELETON}>{placeholder}</span>;
    if (format) return format(value);
    if (value === null || value === undefined) return '';
    return `${value}`;
  };
}

function getStatusTag(caseItem: ICase, now: Date, areCasesLoading?: boolean) {
  if (
    caseItem.status !== CaseStatus.OPEN &&
    caseItem.status !== CaseStatus.CLOSED
  )
    return null;
  const lastTiming =
    caseItem.status === CaseStatus.CLOSED
      ? undefined
      : getNextTruthyCaseTiming(caseItem, null, -1);
  const text =
    caseItem.status === CaseStatus.CLOSED
      ? 'Closed'
      : lastTiming
      ? lastTiming.replace('time', '').toUpperCase()
      : 'Open';
  const intent =
    caseItem.status === CaseStatus.CLOSED
      ? Intent.WARNING
      : caseItem.status === CaseStatus.OPEN &&
        caseItem.timeLastUpdate &&
        differenceInHours(now, new Date(caseItem.timeLastUpdate)) < 24
      ? Intent.SUCCESS
      : Intent.NONE;
  return (
    <Tag
      round
      minimal
      className={areCasesLoading ? BpClasses.SKELETON : ''}
      intent={intent}>
      {text}
    </Tag>
  );
}

export default CasesTableRow;
