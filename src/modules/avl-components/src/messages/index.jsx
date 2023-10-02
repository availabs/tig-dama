import React from 'react';
import { connect } from 'react-redux';

import { dismissSystemMessage } from './reducer';

import {
	SystemMessage,
	ConfirmMessage
} from "./SystemMessage"



const SystemMessages = ({ messages, dismissSystemMessage }) =>
	!messages.length ? null :
	<div className='fixed z-50 top-[70px] right-[350px]'>
		{ messages.map((message, i) =>
				message.onConfirm ?
					<ConfirmMessage key={ message.id } top={ i * 3 } { ...message }
						dismissSystemMessage={ dismissSystemMessage }/> :
					<SystemMessage 
						className={'absolute whitespace-nowrap'} 
						key={ message.id } top={ i * 3 } { ...message }
						dismissSystemMessage={ dismissSystemMessage }/>
			)
		}
	</div>

const mapStateToProps = state => ({
  messages: state.messages
})
export default connect(mapStateToProps, { dismissSystemMessage })(SystemMessages);