# react-json-fp

React-Json-FP is a React component library that uses JSON and functional programming methods to declare how data is displayed. Code-as-data / [homoiconicity](https://en.wikipedia.org/wiki/Homoiconicity) reduces complexity, making apps more easily testable and distributable.

## Playground

CodeSandbox: https://codesandbox.io/s/react-json-fp-5q7ol

## Installation

To install the latest stable version, run the following command:

```
npm install react-json-fp
```

Or if you're using yarn:

```
yarn add react-json-fp
```

## Usage

```jsx
import ReactJsonFP from "react-json-fp"

const App = () => {
  return (
    <ReactJsonFP
      entry="Demo"
      elements={elements}
      data={data}
      actions={actions}
      components={components}
    />
  )
}
```

The required `entry` prop is the key of the element in `elements.json` that will serve as the component's entrypoint.

#### Creating and referencing elements

Elements can use HTML tags or reference each other using the `as` field. When referencing another element, props can be overwritten and deeply merged. The `children` prop can be an array of elements or strings. Any other prop can be added to the object optionally or as required by the element.

##### /elements.json

```yaml
{
  "Demo":
    {
      "as": "div",
      "children":
        [
          "What is your favorite color?",
          { "as": "ColorInput" },
          { "as": "ColorDisplay" },
        ],
    },
  "ColorInput":
    {
      "as": "Input",
      "value": { "$": [{ "$get": ["data.color"] }] },
      "onChange":
        { "$": [{ "$find": ["target.value"] }, { "$set": ["data.color"] }] },
    },
  "ColorDisplay":
    {
      "as": "div",
      "style":
        {
          "width": "32px",
          "height": "32px",
          "background": { "$": [{ "$get": ["data.color"] }] },
        },
    },
}
```

#### Defining initial data

Initial data is accessible as state via callbacks in `actions.json`.

##### /data.json

```yaml
{ "color": "orange" }
```

#### Writing your own actions

Functions can be defined and referenced by elements. The `get`, `set`, and `getElement` callbacks are provided so that elements can read and write to state. `react-json-fp` supplies a default actions, but you can write your own.

##### /actions.js

```jsx
import { actions as defaultActions } from "react-json-fp"

const $find = () => (args) => (prev) => {
  const [path] = args
  const res = path.split(".").reduce((res, prop) => res[prop], prev)
  if (!res) return null
  return res
}

const actions = { ...defaultActions, $find }

export default actions
```

#### Using a component library

An element can use a React component if they are included in the `library` prop. They can be called using the element's `type` field.

##### /components.js

```javascript
import { Input } from "antd"

const components = { Input }

export default components
```

## License

React-Json-FP is MIT licensed.
