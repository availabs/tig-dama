import { connect } from "react-redux"

const withAuth = Component => {
  const mapStateToProps = (state, props) => ({ user: state.user });
  return connect(mapStateToProps, null)(Component);
}
export default withAuth;
