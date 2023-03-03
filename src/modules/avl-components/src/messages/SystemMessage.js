import React from 'react';

import { Button } from "../components"
import { useTheme } from "../wrappers"

const Message = ({ message, top, type, show, dismiss, confirm = null }) => {
  const theme = useTheme();
  return (
    <div className={ `bg-white system-message rounded ${ show }` }
      style={ { top: `${ top }rem` } }>
      <div className={ `
          bg-opacity-25 ${ theme[`bg${ type }`] }
          rounded px-6 py-2 text-large
        ` }>
        <div className="flex justify-center">
          <span className="mr-4">{ message }</span>
          <Button onClick={ dismiss } buttonTheme="buttonSmallPrimary">
            dismiss
          </Button>
          { !confirm ? null :
            <span className="ml-2">
              <Button onClick={ confirm } buttonTheme="buttonSmallSuccess">
                confirm
              </Button>
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
  componentWillUnmount() {
    clearTimeout(this.timeout);
    this.props.dismissSystemMessage(this.props.id);
  }
	dismiss() {
		this.setState({ show: "hide" });
    clearTimeout(this.timeout);
		this.timeout = setTimeout(this.props.dismissSystemMessage, 750, this.props.id);
		this.props.onDismiss();
	}
	render() {
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
