import React from 'react';
import { connect } from 'react-redux';

import { dismissSystemMessage } from './reducer';

import {
	SystemMessage,
	ConfirmMessage
} from "./SystemMessage"

import styled, { keyframes } from "styled-components"

const show = keyframes`
	from {
		opacity: 0;
		right: 200px;
	}
	to {
		opacity: 1;
		right: 0px;
	}
`
const hide = keyframes`
	from {
		opacity: 1;
		right: 0px;
	}
	to {
		opacity: 0;
		right: -200px;
	}
`

const SystemMessageContainer = styled.div`
	position: fixed;
	z-index: 950;
	right: 50px;
	top: 50px;

	.system-message {
		position: absolute;
		white-space: nowrap;
	}
	.system-message.show {
		opacity: 1;
		right: 0px;
		animation: ${ show } 0.75s ease-out;
	}
	.system-message.hide {
		animation: ${ hide } 0.75s ease-in;
	}
`

const SystemMessages = ({ messages, dismissSystemMessage }) =>
	!messages.length ? null :
	<SystemMessageContainer>
		{ messages.map((message, i) =>
				message.onConfirm ?
					<ConfirmMessage key={ message.id } top={ i * 3 } { ...message }
						dismissSystemMessage={ dismissSystemMessage }/> :
					<SystemMessage key={ message.id } top={ i * 3 } { ...message }
						dismissSystemMessage={ dismissSystemMessage }/>
			)
		}
	</SystemMessageContainer>

const mapStateToProps = state => ({
  messages: state.messages
})
export default connect(mapStateToProps, { dismissSystemMessage })(SystemMessages);
