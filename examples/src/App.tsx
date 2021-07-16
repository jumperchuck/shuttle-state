import React, { useState } from 'react';
import Count from './count';
import Todos from './todos';
import TextLength from './text-length';
import Middleware from './middleware';
import Context from './context';

const Examples = [
  { title: 'todos', Component: Todos },
  { title: 'count', Component: Count },
  { title: 'text-length', Component: TextLength },
  { title: 'middleware', Component: Middleware },
  { title: 'context', Component: Context },
];

function App() {
  const [current, setCurrent] = useState(-1);
  const Component = Examples[current]?.Component;
  return (
    <div>
      <ul>
        {Examples.map((item, i) => (
          <li
            key={i}
            onClick={() => setCurrent(i)}
            style={{ color: current === i ? 'orange' : 'black' }}
          >
            {item.title}
          </li>
        ))}
      </ul>
      {Component ? <Component /> : null}
    </div>
  );
}

export default App;
