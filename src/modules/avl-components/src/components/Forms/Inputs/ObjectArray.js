import React, { Component } from "react"
import { List } from 'layouts/components/List/List'
import {Text, TextArea, InputContainer } from 'layouts/components/Forms/Inputs'
import 'styles/tailwind.css';

let Inputs = {
    Text,
    TextArea
}


export default class ObjectArray extends Component {
  constructor(props) {
    super(props);

    let inputState = props.inputs.reduce((a,b) => {
      a[b.name] = ''
      return a
    }, {})

    this.state = {
      textArrayText: '',
      ...inputState,
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

  objectPush = (e) => {
    e.preventDefault()
    let oldData = [...this.state.value]
    let addData = true
    let outputState = this.props.inputs.reduce((a,b) => {
      let output = this.state[b.name]
      if(b.required && output.length === 0){
        addData = false
      }
      a[b.name] = output
      return a
    }, {})

    if(addData){
      oldData.push(outputState)

      this.setState(this.props.inputs.reduce((a,b) => {
        a[b.name] = ''
        return a
      }, {}))
      this.props.onChange({target: {name: this.props.name, value: oldData}})
    }
  }

  render() {
    return (
      <div className="grid grid-cols-6 gap-6">
        {this.props.inputs.map((input,i) => {
          const Input = Inputs[input.type] || Inputs['Text']
          return(
            <InputContainer {...input} key={i}>
              <Input
                onChange={this.handleChange}
                state={this.state}
                {...input}
              />
            </InputContainer>
          )
        })}
        <div className="px-4 py-3  text-right sm:px-6 col-span-6">
          <button onClick={this.objectPush} className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:text-gray-500 hover:bg-white focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24"  stroke="currentColor">
              <path fill='none' d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="ml-2">{this.props.addText || 'Add'}</span>
          </button>
        </div>
        <div className='col-span-6'>
          <List >
            {this.state.value.map((item,i) => {
              return <React.Fragment key={i}>{this.props.list ? this.props.list(item) : ''}</React.Fragment>
          })}
          </List>
        </div>
      </div>
    )
  }
}
