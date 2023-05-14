import React from "react"

import { Button } from "../Button"

import { composeOptions, useSetRefs, useClickOutside } from "../utils"
import { useTheme } from "../../wrappers/with-theme"

import MarkdownRenderer from "react-markdown"

import linkifyIt from "linkify-it"
import tlds from "tlds"

const linkify = linkifyIt()
  .tlds(tlds)
  .add("ftp", null)
  .set({ fuzzyIP: true });

const Link = ({ href, children }) => {
  const theme = useTheme();
  return (
    <a href={ href } className={ `
      ${ theme.textInfo } hover:underline
    ` }>
      { children }
    </a>
  )
}
const Text = ({ value = "" }) => {
  const links = linkify.match(value);
  if (!links) return value;
  const response = []
  let index = 0;

  links.forEach(link => {
    response.push(value.slice(index, link.index));
    response.push(
      <Link key={ link.index } href={ link.url }>
        { link.text }
      </Link>
    )
    index = link.lastIndex;
  })
  response.push(value.slice(index));

  return response.filter(Boolean);
}
const Code = ({ value, ...rest }) => {
  const theme = useTheme();
  return (
    <pre className={ `
      rounded ${ theme.accent1 } px-2 py-1
      scrollbar overflow-x-auto
    ` }>
      <Text value={ value }/>
    </pre>
  )
}
const BlockQuote = ({ children, ...rest }) => {
  const theme = useTheme();
  return (
    <blockquote className={ `
      rounded ${ theme.accent1 } px-2 py-1 whitespace-pre-wrap
    ` }>
      { children }
    </blockquote>
  )
}

const renderers = {
  heading: ({ level, children }) => {
    return level === 1 ? (
      <h1 className="font-bold text-3xl">{ children }</h1>
    ) : level === 2 ? (
      <h2 className="font-bold text-2xl">{ children }</h2>
    ) : level === 3 ? (
      <h3 className="font-bold text-xl">{ children }</h3>
    ) : (
      <h4 className="font-bold text-lg">{ children }</h4>
    )
  },
  list: ({ ordered, children }) => {
    return ordered ? (
      <ol className="list-decimal list-inside">
        { children }
      </ol>
    ) : (
      <ul className="list-disc list-inside">
        { children }
      </ul>
    )
  },
  code: Code,
  blockquote: BlockQuote,
  paragraph: ({ children }) => {
    return (
      <p className="whitespace-pre-wrap">
        { children }
      </p>
    )
  },
  text: Text,
  link: Link
}

export const MarkdownViewer = ({ markdown, ...props }) =>
  <MarkdownRenderer renderers={ renderers } { ...props }>
    { markdown }
  </MarkdownRenderer>

export default React.forwardRef(({ large, small, className = "",
                                    children, onChange, value, autoFocus,
                                    disabled= false, placeholder = "enter some markdown...",
                                    ...props }, ref) => {
  const [editing, setEditing] = React.useState(!value),
    prevState = React.useRef(editing),
    prevValue = React.useRef();

  const handleChange = React.useCallback(e => {
    onChange(e.target.value);
  }, [onChange]);

  const theme = useTheme(),
    inputTheme = theme[`input${ composeOptions({ large, small }) }`];

  const [innerRef, setInnerRef] = React.useState(null);

  React.useEffect(() => {
    if (autoFocus && innerRef) {
      innerRef.focus();
      setEditing(true);
    }
  }, [autoFocus, innerRef]);

  React.useEffect(() => {
    if (editing && innerRef && (prevValue.current !== value)) {
      innerRef.style.height = 'auto';
      innerRef.style.height = `calc(${ innerRef.scrollHeight }px + 0.125rem)`;
      prevValue.current = value;
    }
    if (editing && !prevState.current) {
      innerRef.focus();
    }
    prevState.current = editing;
  }, [value, editing, innerRef]);

  const clickedOutside = React.useCallback(e => {
    setEditing(!value);
  }, [value]);
  const [setNode] = useClickOutside(clickedOutside);

  return (
    <div ref={ setNode } className="relative"
      onDoubleClick={ e => setEditing(true) }>
      { !value ? null :
        <div className="absolute right-0 top-0 mr-1 mt-1">
          <Button tabIndex={ -1 } small key={ editing ? "editing" : "viewing" }
            onClick={ e => setEditing(editing => !editing) }>
            { editing ? "preview" : "edit" }
          </Button>
        </div>
      }
      <textarea { ...props } rows={ 1 }
        tabIndex={ disabled || !editing ? -1 : 0 }
        value={ value || "" } onChange={ handleChange }
        style={ { display: editing ? "block" : "none" } }
        className={ `${ inputTheme } ${ className } resize-none` }
        onFocus={ e => editing && innerRef.focus() }
        onBlur={ e => setEditing(!value) }
        placeholder={ placeholder }
        ref={ useSetRefs(ref, setInnerRef) }/>

      <div tabIndex={ disabled || editing ? -1 : 0 }
        className={ `
          ${ inputTheme } ${ className } ${ editing ? "hidden" : "block" }
        ` }>
     		<MarkdownRenderer renderers={ renderers }>
          { value }
        </MarkdownRenderer>
      </div>
    </div>
  )
})
