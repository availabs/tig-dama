const UPDATE_FALCOR = 'redux-falcor::UPDATE';

export const updateCache = falcorCache => dispatch =>
  Promise.resolve(dispatch({
    type: UPDATE_FALCOR,
    falcorCache
  }))

export const falcorCache = (state = {}, action) =>
  action.type === UPDATE_FALCOR ? { ...action.falcorCache } : state
