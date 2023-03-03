import React from "react"
import { Button, LinkButton } from "../Button"
import styled from "styled-components"
import { ScalableLoading } from "../Loading"
import { useTheme } from "../../wrappers"
const ModalContainerBase = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  height: 100%;
  z-index: 100000;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  transition: 1s;
  &.show {
    pointer-events: auto;
    opacity: 1;
    overflow-x: hidden;
    overflow-y: visible !important;
  }
  &.hide {
    opacity: 0;
  }
  div.body {
    position: relative;
    transition: 1s;
  }
  &.show div.body {
    bottom: 0%;
  }
  &.hide div.body {
    bottom: 100%;
  }
`
const ModalContainer = styled(ModalContainerBase)`
  width: 100%;
`
const PositionedModalContainer = styled(ModalContainerBase)`
  padding 0px 50px;
`
const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0));
`
class Modal extends React.Component {
  static defaultProps = {
    onHide: () => {},
    show: false,
    actions: [],
    hideOnAction: true,
    closeLabel: "Close",
    usePositioned: false,
    showCloseButton: true
  }
  state = {
    onResolve: null,
    onReject: null,
    loading: false
  }
  componentDidUpdate(oldProps) {
    if (this.props.show && !oldProps.show) {
      this.setState({ onResolve: null, onReject: null });
    }
  }
  onHide() {
    this.props.onHide();
  }
  onAction(e, { action, onResolve, onReject }) {
    this.setState({ loading: true });
    Promise.resolve(action(e))
        .then(res => {
          this.setState({ loading: false });
          if (onResolve) {
            this.onResolve(res, onResolve);
          }
          else if (this.props.hideOnAction) {
            this.onHide();
          }
        })
        .catch(e => {
          console.log("<AvlModal.onAction> ERROR:", e);
          this.setState({ loading: false });
          Boolean(onReject) && this.onReject(e, onReject);
        });
  }
  onResolve(res, comp) {
    this.setState({ onResolve: { res, comp } });
  }
  onReject(error, comp) {
    this.setState({ onReject: { error, comp } });
  }
  render() {
    const { show, actions } = this.props,
        { onResolve, onReject } = this.state,
        filteredActions = actions.filter(a => a.show !== false),
        Container = this.props.usePositioned ? PositionedModalContainer : ModalContainer;

    return (
      <Container className={ `${ show ? "show" : "hide" }` }>

        { !this.state.loading ? null :
          <LoadingContainer>
            <ScalableLoading />
          </LoadingContainer>
        }

        <BodyContainer>
          <ContentContainer className="rounded py-2 px-3">
            { onResolve ? <onResolve.comp res={ onResolve.res }/> :
              onReject ? <onReject.comp error={ onReject.error }/> :
              this.props.children
            }
          </ContentContainer>
          <ContentContainer className="flex rounded mt-3 p-2">
            { !this.props.showCloseButton ? null :
              <div className="flex-0">
                <Button buttonTheme="buttonDanger" tabIndex={ -1 }
                  onClick={ e => this.onHide() }>
                  { this.props.closeLabel }
                </Button>
              </div>
            }
            { !filteredActions.length || Boolean(onResolve) || Boolean(onReject) ? null :
              <div className="flex-1 flex justify-end">
                { filteredActions.map(({ label, buttonTheme="button", disabled=false, url, ...rest }, i) =>
                    url === undefined ?
                      <Button onClick={ e => this.onAction(e, rest) } key={ i } tabIndex={ -1 }
                        disabled={ disabled } buttonTheme={ buttonTheme } className="ml-1">
                        { label }
                      </Button>
                    :
                      <LinkButton to={ url || "#" } key={ i } className="ml-1" tabIndex={ -1 }>
                        { label }
                      </LinkButton>
                  )
                }
              </div>
            }
          </ContentContainer>
        </BodyContainer>
      </Container>
    )
  }
}
export default Modal

const BodyContainer = ({ children }) => {
  const theme = useTheme();
  return (
      <div className={ `
        body inline-block rounded p-3 ${ theme.accent2 }
      ` }>
        { children }
      </div>
  )
}
const ContentContainer = ({ className = "", children }) => {
  const theme = useTheme();
  return (
      <div className={ `
      ${ theme.bg } ${ className }
    ` }>
        { children }
      </div>
  )
}
