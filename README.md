Figtree is a tiny React component that generates a component tree and manages its state, all from a static configuration file that looks like this:

```json
{
  "type": "div",
  "children": [
    "Enter your name: ",
    {
      "type": "input",
      "props": {
        "value": { "$getState": ["bar"] },
        "onChange": { "$setState": ["bar"] }
      }
    }
  ]
}
```

## Motivation

## Playground

- [Basic Demo](https://codesandbox.io/s/figtree-js-5q7ol)
- [Realworld Demo](https://rlee0.github.io/figtree-realworld-dev)

## Installation

To install the latest stable version, run the following command:

`npm install figtree-js`

Or if you're using yarn:

`yarn add figtree-js`

## Usage

```jsx
import { Figtree } from "figtree-js";

const App = () => {
  return <Figtree entry={{ as: "div", children: "Hello World" }} />;
};
```

## Features

### Declare the component tree

#### Modify props

#### Reference elements

#### Reference custom React components

### Manage state

#### Declare initial state

#### Make changes to state

#### Use custom functions

## License

figtree-js is MIT licensed.
