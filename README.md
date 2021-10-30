# react-json-fp

React-JSON-FP is a React component library that uses JSON and functional programming methods to declare how data is displayed. Code-as-data / [homoiconicity](https://en.wikipedia.org/wiki/Homoiconicity) reduces complexity, making apps more easily testable and distributable.

## Playground

CodeSandbox: <https://codesandbox.io/s/react-json-fp-5q7ol>

## Installation

To install the latest stable version, run the following command:

`npm install react-json-fp`

Or if you're using yarn:

`yarn add react-json-fp`

## Usage

```jsx
import ReactJsonFP from 'react-json-fp'

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

The required `entry` prop is the key of the element in `elements.json` that will be

### Creating and referencing elements

Elements can use HTML tags or reference each other using the `as` field. When referencing another element, props can be overwritten and deeply merged. The `children` prop can be an array of elements or strings. Any other prop can be added to the object optionally or as required by the element.

#### /elements.json

```yaml
{
  Demo:
    {
      as: 'div',
      style:
        {
          padding: '1rem',
          background: { $value: [{ $getData: ['favorite_color'] }] },
        },
      children: [{ as: 'Input' }, { as: 'Button' }],
    },
  Input:
    {
      as: 'input',
      value: { $value: [{ $getData: ['favorite_color'] }] },
      onChange:
        {
          $flow: [{ $get: ['target.value'] }, { $setData: ['favorite_color'] }],
        },
    },
}
```

### Defining initial data

Initial data is accessible as state via callbacks in `actions.json`.

#### /data.json

```yaml
{ 'favorite_color': 'magenta' }
```

### Writing your own actions

Functions can be defined and referenced by elements. The `getData`, `setData`, and `getElement` callbacks are provided so that elements can read and write to state. `react-json-fp` supplies a default actions, but you can write your own.

#### /actions.js

```jsx
import { actions as defaultActions } from 'react-json-fp'

const $log =
  ({ getData }) =>
  (args) => {
    const [path] = args
    console.log(getData(path))
  }

const actions = { ...defaultActions, $find }

export default actions
```

### Using a component library

An element can use a React component if they are included in the `components` prop. They can be called using the element's `as` field.

#### /components.js

```javascript
import { Input } from 'antd'

const components = { Input }

export default components
```

## License

React-Json-FP is MIT licensed.
