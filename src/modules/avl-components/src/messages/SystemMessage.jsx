import React from 'react';
//import './messages.css'


const Message = ({ message, top, type, show, dismiss, confirm = null }) => {
  const theme = {
    'bgDanger' : 'bg-red-300 border border-red-400'
  }
  console.log('type', type, top)
  return (
    <div className={ `bg-white absolute whitespace-nowrap rounded ${ show }` }
      style={ { top: `${ top }rem` } }>
      <div className={ `
          bg-opacity-25 ${ theme[`bg${ type }`] }
          rounded px-6 py-2 text-large
        ` }>
        <div className="flex justify-center ">
          <div className="mr-4 p-2">{ message }</div>
          <button onClick={ dismiss } className={`px-3 rounded-md hover:bg-white text-xl`}>
            ✕
          </button>
          { !confirm ? null :
            <span className="ml-2">
              <button onClick={ confirm }className={`px-3 rounded-md hover:bg-white text-xl`} >
                ✓
              </button>
            </span>
          }
        </div>
      </div>
    </div>
  )
}

export class SystemMessage extends React.Component {
	state = { show: "show" };
  timeout = null
	componentDidMount() {
		if (this.props.duration) {
			this.timeout = setTimeout(this.dismiss.bind(this), this.props.duration);
		}
	}
  // componentWillUnmount() {
  //   clearTimeout(this.timeout);
  //   console.log('will unmount dismiss')
  //   this.props.dismissSystemMessage(this.props.id);
  // }
	dismiss() {
    console.log('dismissing')
		this.setState({ show: "hide" });
    clearTimeout(this.timeout);
		this.timeout = setTimeout(this.props.dismissSystemMessage, 750, this.props.id);
		this.props.onDismiss();
	}
	render() {
		console.log('rendering message', this.props, this.state)
    return (
      <Message { ...this.props } { ...this.state }
        dismiss={ e => this.dismiss(e) }/>
		)
	}
}

export class ConfirmMessage extends SystemMessage {
	confirm() {
		this.setState({ show: "hide" });
    clearTimeout(this.timeout);
    console.log('confirm message')
		this.timeout = setTimeout(this.props.dismissSystemMessage, 750, this.props.id);
		this.props.onConfirm();
	}
	render() {
		return (
      <Message { ...this.props } { ...this.state }
        dismiss={ e => this.dismiss(e) }
        confirm={ e => this.confirm(e) }/>
		)
	}
}