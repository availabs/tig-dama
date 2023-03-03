import React from 'react'
import {
  useFilters,
  useGlobalFilter,
  useSortBy,
  useTable,
  usePagination,
  useExpanded
} from 'react-table'

import { Button } from "../Button"
import Select from "../Inputs/Select"
import get from 'lodash.get'
import { matchSorter } from 'match-sorter'

import { useTheme } from "../../wrappers/with-theme"

const DefaultColumnFilter = ({ column }) => {
  const {
      filterValue = "",
      // preFilteredRows,
      setFilter
    } = column;
    // count = preFilteredRows.length;
    const theme = useTheme().table();
  return (
    <div className="w-3/4">
      <input className={ theme.inputSmall }
        value={ filterValue } onChange={ e => setFilter(e.target.value) }
        onClick= { e => e.stopPropagation() }
        placeholder={ `Search...` }/>
    </div>
  )
}

const DropDownColumnFilter = ({
                                     column: { filterValue, setFilter, preFilteredRows, id , filterMeta, filterDomain, onFilterChange, customValue, filterThemeOptions, filterClassName, filterMulti, filterRemovable = true},
                                 }) => {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options = new Set()
        if (filterMeta){
            return filterMeta
        }
        preFilteredRows.forEach(row => {
            options.add(row.values[id])
        })
        return [...options.values()]
    }, [filterMeta, id, preFilteredRows])
        .filter(d => d)

    const count = preFilteredRows.length;
    // Render a multi-select box
    return (
        <div className="">
            <Select
                domain = {filterDomain || options}
                value = {filterValue || customValue || []}
                // value = {['row2']}
                onChange={(e) => {
                    setFilter(e || undefined)
                    onFilterChange(e || undefined) // Set undefined to remove the filter entirely
                }}
                placeHolder={`Search ${count} records...`}
                removable={filterRemovable}
                multi={filterMulti}
                themeOptions = {filterThemeOptions}
                className={`${filterClassName}`}
            />
        </div>
    )
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

function DropDownFilterFn(rows, id, filterValue) {
  return rows.filter(row => {
        const rowValue = row.values[id];
        return rowValue !== undefined && Array.isArray(filterValue) && filterValue.length
            ? filterValue.includes(rowValue)
            : rowValue !== undefined && filterValue.length ? rowValue === filterValue : true
    })
}

const getPageSpread = (page, maxPage) => {
	let low = page - 2,
		high = page + 2;

	if (low < 0) {
		high += -low;
		low = 0;
	}
	if (high > maxPage) {
		low -= (high - maxPage);
		high = maxPage;
	}
  const spread = [];
  for (let i = Math.max(0, low); i <= Math.min(maxPage, high); ++i) {
    spread.push(i);
  }
  return spread;
}

const DefaultExpandedRow = ({ values }) =>
  <div className="flex">
    { values.map(({ key, value }, i) =>
        <div key={ key || `key-${ i }` } className="flex-1">
          { key ? <b>{ key }:</b> : null }
          <span className="ml-1">{ value }</span>
        </div>
      )
    }
  </div>

const EMPTY_ARRAY = [];

export default ({ columns = EMPTY_ARRAY,
                  data = EMPTY_ARRAY,
                  sortBy, sortOrder = "",
                  initialPageSize = 10,
                  pageSize = null,
                  onRowClick,
                  onRowEnter,
                  onRowLeave,
                  ExpandRow = DefaultExpandedRow,
                  disableFilters = false,
                  disableSortBy = false,
                  themeOptions = {},
                  ...props }) => {

    const theme = useTheme().table(themeOptions);

    const filterTypes = React.useMemo(
      () => ({
        fuzzyText: fuzzyTextFilterFn, dropdown: DropDownFilterFn
      }), []
    );

    const filters = React.useMemo(
      () => ({
          dropdown: DropDownColumnFilter
      }), []
    );

    const defaultColumn = React.useMemo(
      () => ({ Filter: DefaultColumnFilter }), []
    );

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      rows,
      preFilteredRows,
      prepareRow,
      canPreviousPage,
      canNextPage,
      gotoPage,
      previousPage,
      nextPage,
      pageCount,
      visibleColumns,
      toggleRowExpanded,
      setPageSize,
      state: {
        pageSize: statePageSize,
        pageIndex,
        expanded
      }
    } = useTable(
      { columns,
        data,
        defaultColumn,
        filterTypes,
        disableFilters,
        disableSortBy,
        initialState: {
          pageSize: pageSize || initialPageSize,
          sortBy: [{ id: sortBy, desc: sortOrder.toLowerCase() === "desc" }]
        }
      },
      useFilters,
      useGlobalFilter,
      useSortBy,
      useExpanded,
      usePagination
    );

    React.useEffect(() => {
      if ((pageSize !== null) && (pageSize !== statePageSize)) {
        setPageSize(pageSize);
      }
    }, [pageSize, statePageSize, setPageSize]);

    if (!(columns.length && data.length)) return null;

    if (!preFilteredRows.length) return null;

    const filterLocationToClass = {
        inline: 'flex-row',
        [undefined]: 'flex-col'
    }

    return (
      <div className="overflow-auto scrollbar-sm">
        <table { ...getTableProps() } className="w-full">
          <thead>
            { headerGroups.map(headerGroup =>
                <tr { ...headerGroup.getHeaderGroupProps() }>
                  { headerGroup.headers
                      .map(column =>
                        <th { ...column.getHeaderProps({
                            ...column.getSortByToggleProps(),
                                style: { minWidth: column.minWidth, width: column.width, maxWidth: column.maxWidth },
                            }) }
                          className={ theme.tableHeader }>
                          <div className={'flex flex-col'}>
                              <div className={`flex justify-between`}>
                                  <div className="flex-1 pr-1">{ column.render("Header") }</div>

                                  { !column.canSort ? null :
                                      !column.isSorted ? <i className={`ml-2 pt-1 ${theme.sortIconIdeal}`}/> :
                                          column.isSortedDesc ? <i className={`ml-2 pt-1 ${theme.sortIconDown}`}/> :
                                              <i className={`ml-2 pt-1 ${theme.sortIconUp}`}/>
                                  }
                              </div>
                              <div>
                                  { !column.canFilter ? null : <div>{ column.render(filters[column.filter] || 'Filter') }</div> }
                              </div>
                          </div>
                        </th>
                      )
                  }
                </tr>
              )
            }

          </thead>
          <tbody { ...getTableBodyProps() }>
            { page.map(row => {
                const { onClick, expand = [] } = row.original;
                prepareRow(row);
                return (
                  <React.Fragment key={ row.getRowProps().key }>
                    <tr { ...row.getRowProps() }
                      onMouseEnter={ typeof onRowEnter === "function" ? e => onRowEnter(e, row) : null }
                      onMouseLeave={ typeof onRowLeave === "function" ? e => onRowLeave(e, row) : null }
                      className={ `
                        ${ props.striped ? theme.tableRowStriped : theme.tableRow }
                        ${ (onClick || onRowClick) ? "cursor-pointer" : "" }
                      ` }
                      onClick={ e => {
                        (typeof onRowClick === "function") && onRowClick(e, row);
                        (typeof onClick === "function") && onClick(e, row);
                      } }>
                        { row.cells.map((cell, ii) =>
                            <td { ...cell.getCellProps({
                                style: {
                                    minWidth: cell.column.minWidth,
                                    maxWidth: cell.column.maxWidth,
                                    width: cell.column.width,
                                },
                            }) } className={ `text-${get(columns.find(c => c.Header === cell.column.Header), 'align') || 'center'} ${theme.tableCell}` }>
                              { (ii > 0) || ((row.subRows.length === 0) && (expand.length === 0)) ?
                                  cell.render('Cell')
                                :
                                  <div className="flex items-center">
                                    <div className="flex-1">{ cell.render('Cell') }</div>
                                    <div onClick={ e => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      Object.keys(expanded).filter(k => k !== row.id)
                                        .forEach(toggleRowExpanded);
                                      row.toggleRowExpanded(!row.isExpanded);
                                    } } className={ `
                                        flex item-center justify-center
                                        rounded cursor-pointer py-1 px-2
                                        hover:${ theme.accent3 } ${ theme.transition }
                                      ` }>
                                      { row.isExpanded ?
                                        <i className="fas fa-chevron-up"/> :
                                        <i className="fas fa-chevron-down"/>
                                      }
                                    </div>
                                  </div>
                              }
                            </td>
                          )
                        }
                    </tr>
                    { !row.isExpanded || !expand.length ? null :
                      <tr className={ theme.tableRow }>
                        <td colSpan={ visibleColumns.length } className={ theme.tableCell }>
                          <ExpandRow values={ expand }/>
                        </td>
                      </tr>
                    }
                  </React.Fragment>
                )
              })
            }

          </tbody>
           <tfoot>
              { pageCount <= 1 ? null :
              <tr className={ theme.tableInfoBar }>
                <td colSpan={ columns.length } className="px-4">
                  <div className={ `flex items-center ${ theme.textInfo }` }>
                    <div className="flex-0">
                      Page { pageIndex + 1 } of { pageCount }
                      <br />{/*<span className="font-extrabold">&nbsp; | &nbsp;</span>*/}
                      Rows { pageIndex * statePageSize + 1 }-
                      { Math.min(rows.length, pageIndex * statePageSize + statePageSize) } of { rows.length }
                    </div>
                    <div className={ `flex-1 flex justify-end items-center` }>
                      <Button disabled={ pageIndex === 0 } themeOptions={{size:'sm'}}
                        onClick={ e => gotoPage(0) }>
                        { "<<" }
                      </Button>
                      <Button disabled={ !canPreviousPage } themeOptions={{size:'sm'}}
                        onClick={ e => previousPage() }>
                        { "<" }
                      </Button>
                      { getPageSpread(pageIndex, pageCount - 1)
                          .map(p => {
                            const active = (p === pageIndex);
                            return (
                              <Button key={ p } themeOptions={{size:'sm', color: active ? 'primary' : 'white' }}
                                onClick={ active ? null : e => gotoPage(p) }>
                                { p + 1 }
                              </Button>
                            )
                          })
                      }
                      <Button disabled={ !canNextPage } themeOptions={{size:'sm'}}
                        onClick={ e => nextPage(0) }>
                        { ">" }
                      </Button>
                      <Button disabled={ pageIndex === (pageCount - 1) } themeOptions={{size:'sm'}}
                        onClick={ e => gotoPage(pageCount - 1) }>
                        { ">>" }
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            }
            </tfoot>
        </table>
      </div>
    )
}
