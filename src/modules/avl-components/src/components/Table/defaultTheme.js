
const defaultTableTheme =  (opts = {color:'white', size: 'compact'}) => {
  const {color = 'white', size = 'compact'} = opts
  let colors = {
      white: 'bg-white hover:bg-blue-50',
      gray: 'bg-gray-100 hover:bg-gray-200',
      transparent: 'gray-100',
      total: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold'
  }

  let sizes = {
      small: 'px-4 py-1 text-xs',
      compact: 'px-4 py-1 text-sm',
      full: 'px-10 py-5'
  }
  return {
      tableHeader:
          `${sizes[size]} pb-1 h-8 border border-b-4 border-gray-200 bg-slate-50 text-left font-semibold text-gray-700 uppercase first:rounded-tl-md last:rounded-tr-md`,
      tableInfoBar: "bg-white",
      tableRow: `${colors[color]} transition ease-in-out duration-150 hover:bg-blue-100`,
      totalRow: `${colors.total} transition ease-in-out duration-150`,
      tableOpenOutRow: 'flex flex-col',
      tableRowStriped: `bg-white odd:bg-blue-50 hover:bg-blue-100 bg-opacity-25 transition ease-in-out duration-150`,
      tableCell: `${sizes[size]} break-words border border-gray-200 pl-1 align-top font-light text-sm`,
      inputSmall: 'w-24',
      sortIconDown: 'fas fa-sort-amount-down text-tigGray-300 opacity-75',
      sortIconUp: 'fas fa-sort-amount-up text-tigGray-300 opacity-75',
      sortIconIdeal: 'fa fa-sort-alt text-tigGray-300 opacity-25',
      infoIcon: 'fas fa-info text-sm text-blue-300 hover:text-blue-500',
      vars: {
          color: colors,
          size: sizes
      }
  }
 
}

export default defaultTableTheme