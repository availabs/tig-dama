import React, { Component } from "react"
import { List, ListItemRemovable} from 'layouts/components/List/List'
import 'styles/tailwind.css';



export default class TextArray extends Component {
  constructor(props) {
    super();
    this.state = {
      textArrayText: '',
      value: props.state[props.name] || []
    }
  }

  static getDerivedStateFromProps(nextProps) {
   return {
    value: nextProps.state[nextProps.name]
   };
  }

  handleChange = (e, type='text') => {
    this.setState({[e.target.name]: e.target.value})
  }

  textPush = (e) => {
    e.preventDefault()
    let oldData = [...this.state.value]
    oldData.push(this.state.textArrayText)
    this.setState({textArrayText: ''})
    this.props.onChange({target: {name: this.props.name, value: oldData}})
  }

  render() {
    return (
      <div>
        <div className='flex'>
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <input 
              name="textArrayText"
              value={this.state.textArrayText}
              onChange={this.handleChange}
              className="form-input block w-full rounded-none rounded-l-md pl-10 transition ease-in-out duration-150 sm:text-sm sm:leading-5" 
              placeholder={this.props.placeholder} 
            />
          </div>
          <button onClick={this.textPush} className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:text-gray-500 hover:bg-white focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24"  stroke="currentColor">
              <path fill='none' d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="ml-2">{this.props.buttonText}</span>
          </button>
        </div>
        <div>
          <List>
            {this.state.value.map(item => <ListItemRemovable item={item} />)}
          </List>
        </div>
      </div>
    )
  }
}