import { connect } from "react-redux"

const Connect = (Component, options = {}) => {
  const {
    mapStateToProps = null,
    mapDispatchToProps = null
  } = options;
  return connect(mapStateToProps, mapDispatchToProps)(Component);
}
export default Connect;
