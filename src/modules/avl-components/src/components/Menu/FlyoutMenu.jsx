import React from 'react'


const FlyoutMenu = ({open,items,bottomItems}) => {
	return (
		<div className={`absolute  inset-x-0 transform shadow-lg z-50 ${open ? '' : 'hidden'}`}>
		  <div className="bg-white">
		    <div className="max-w-7xl mx-auto grid gap-y-6 px-4 py-6 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-4 lg:px-8 lg:py-12 xl:py-16">
		      {items.map((item,i) => 
			      <a href={`${item.href}`} key={i} className="-m-3 p-3 flex flex-col justify-between rounded-lg hover:bg-gray-50 transition ease-in-out duration-150">
			        <div className="flex md:h-full lg:flex-col">
			          <div className="flex-shrink-0">
			            <div className="inline-flex text-2xl items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white sm:h-12 sm:w-12">
			              {/* Heroicon name: outline/chart-bar */}
			              <i className={item.icon}/>
			            </div>
			          </div>
			          <div className="ml-4 md:flex-1 md:flex md:flex-col md:justify-between lg:ml-0 lg:mt-4">
			            <div>
			              <p className="text-base font-medium text-gray-900">{item.title}</p>
			              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
			            </div>
			            <p className="mt-2 text-sm font-medium text-blue-600 lg:mt-4">Learn more <span aria-hidden="true">→</span></p>
			          </div>
			        </div>
			      </a>
			    )
		 	}
		     
		      
		    </div>
		  </div>
		  <div className="bg-gray-50">
		    <div className="max-w-7xl mx-auto space-y-6 px-4 py-1 sm:flex sm:space-y-0 sm:space-x-10 sm:px-6 lg:px-8">
		      {bottomItems.map((item,i) => <div key={i} className='flow-root'>{item}</div>)}
		    </div>
		  </div>
		</div>
	)
}

export default FlyoutMenu