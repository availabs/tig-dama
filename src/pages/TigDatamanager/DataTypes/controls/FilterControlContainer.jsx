export const FilterControlContainer = ({header, input}) => {
  const controlClassName = "w-full bg-blue-100 rounded mr-2 p-1 text-md capitalize";
  return (
    <div className="flex flex-col pt-2">
      <div className="flex px-2 pb-1 text-xs text-gray-400 capitalize">
        {header}
      </div>
      <div className="flex pl-1">
        {input({className: controlClassName})}
      </div>
    </div>
  )
}