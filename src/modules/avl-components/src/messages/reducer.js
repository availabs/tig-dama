const SEND_SYSTEM_MESSAGE = "SEND_SYSTEM_MESSAGE",
  DISMISS_SYSTEM_MESSAGE = "DISMISS_SYSTEM_MESSAGE";

let UNIQUE_ID = 0;
const getUniqueId = () =>
  `system-message-${ ++UNIQUE_ID }`;

const MESSAGE_TYPES = ["Danger", "Warning", "Success", "Info"];
const DEFAULT_MESSAGE_OPTIONS = {
  duration: 7500,
  type: MESSAGE_TYPES[0],
  onDismiss: () => {},
  onConfirm: null
}
const getMessageOptions = options => {
  if (!options.id) {
    options.id = getUniqueId();
  }
  if (!MESSAGE_TYPES.includes(options.type)) {
    options.type = MESSAGE_TYPES[0];
  }
  return options;
}

export const sendSystemMessage = (message, options={}) =>
  dispatch =>
    Promise.resolve(
      dispatch({
        type: SEND_SYSTEM_MESSAGE,
        message,
        options: getMessageOptions({ ...DEFAULT_MESSAGE_OPTIONS, ...options })
      })
    )

export const dismissSystemMessage = id =>
  dispatch =>
    Promise.resolve(
      dispatch({
        type: DISMISS_SYSTEM_MESSAGE,
        id
      })
    )

export default (state=[], action) => {
  // console.log('message reducer' ,state, action)
  switch (action.type) {
    case SEND_SYSTEM_MESSAGE: {
      let newState = state.filter(({ id }) => id !== action.options.id);
      newState.push({ message: action.message, ...action.options });
      return newState;
    }
    case DISMISS_SYSTEM_MESSAGE: {
      return state.filter(({ id }) => id !== action.id);
    }
    default:
      return state;
  }
}