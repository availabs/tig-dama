import React from "react"
import PropTypes from "prop-types"

import get from "lodash/get"

import withAuth from "./with-auth"

// import { API_HOST } from "~/config"

export default (Component, options = {}) => {
  // const {
  //   baseUrl = API_HOST
  // } = options;
  class ImgLoaderWrapper extends React.Component {
    static propTypes = {
      imgUploadUrl: PropTypes.string.isRequired
    }
    constructor(...args) {
      super(...args);
      this.state = {
        loading: false,
        message: ""
      }
      this.uploadImage = this.uploadImage.bind(this);
      this.editImage = this.editImage.bind(this);
      this.saveImage = this.saveImage.bind(this);
    }
    uploadImage(file) {
      if (!file) return Promise.resolve(null);
      if (!/^image[/]/.test(file.type)) {
        this.setState({ message: "File was not an image." });
        return Promise.resolve(null);
      }
      const filename = file.name.replace(/\s+/g, "_");

      this.setState({ message: "", loading: true });

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      return new Promise(resolve => {
        reader.addEventListener("load", () => {
          fetch(`${ this.props.imgUploadUrl }/upload/${ filename }`, {
            method: "POST",
            body: reader.result,
            headers: {
              "Content-Type": "application/octet-stream",
              "Authorization": get(this.props, ["user", "token"], "")
            }
          })
          .then(res => {
            if (!res.ok) {
              resolve({ url: null });
            }
            return res.json();
          })
          .then(resolve);
        })
      })
      .then(({ url }) => {
        this.setState({ loading: false });
        return { url, filename };
      })
    }
    editImage(src, filename, action, args) {
      this.setState({ loading: true });
      return new Promise(resolve => {
        fetch(`${ this.props.imgUploadUrl }/edit/${ filename }/${ action }/${ args }`, {
          method: "POST",
          body: JSON.stringify({ src: encodeURI(src) }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": get(this.props, ["user", "token"], "")
          }
        })
        .then(res => {
          if (!res.ok) {
            resolve({ url: null });
          }
          return res.json();
        })
        .then(resolve);
      })
      .then(({ url }) => {
        this.setState({ loading: false });
        return url;
      })
    }
    saveImage(src, filename, history) {
      this.setState({ loading: true });
      return new Promise(resolve => {
        fetch(`${ this.props.imgUploadUrl }/save/${ filename }`, {
          method: "POST",
          body: JSON.stringify({
            src,
            history
          }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": get(this.props, ["user", "token"], "")
          }
        })
        .then(res => {
          if (!res.ok) {
            resolve({ url: null });
          }
          return res.json();
        })
        .then(resolve);
      })
      .then(({ url }) => {
        this.setState({ loading: false });
        return url;
      })
    }
    render() {
      const { forwardRef, ...props } = this.props;
      return (
        <Component { ...props } { ...this.state } ref={ forwardRef }
          uploadImage={ this.uploadImage }
          editImage={ this.editImage }
          saveImage={ this.saveImage }/>
      )
    }
  }
  const Wrapped = withAuth(ImgLoaderWrapper)
  return React.forwardRef((props, ref) => <Wrapped { ...props } forwardRef={ ref }/>)
}
