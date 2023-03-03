import React from "react";
import { CSSTransition } from "react-transition-group";

export default ({ show, enter, enterFrom, enterTo, leave, leaveFrom, leaveTo, classNames, children }) => {
  const enterClasses = enter && enter.split(" ");
  const enterFromClasses = enterFrom.split(" ");
  const enterToClasses = enterTo.split(" ");
  const leaveClasses = leave && leave.split(" ");
  const leaveFromClasses = leaveFrom.split(" ");
  const leaveToClasses = leaveTo.split(" ");

  return (
    <CSSTransition
      classNames={classNames}
      unmountOnExit
      in={show}
      addEndListener={(node, done) => {
        node.addEventListener("transitionend", done, false);
      }}
      onEnter={node => {
        node.classList.add(...(enter && enterClasses), ...enterFromClasses);
      }}
      onEntering={node => {
        node.classList.remove(...enterFromClasses);
        node.classList.add(...enterToClasses);
      }}
      onEntered={node => {
        node.classList.remove(...(enter && enterToClasses), ...enterClasses);
      }}
      onExit={node => {
        node.classList.add(...(leave && leaveClasses), ...leaveFromClasses);
      }}
      onExiting={node => {
        node.classList.remove(...leaveFromClasses);
        node.classList.add(...leaveToClasses);
      }}
      onExited={node => {
        node.classList.remove(...leaveToClasses, ...(leave && leaveClasses));
      }}
    >
      {children}
    </CSSTransition>
  );
};