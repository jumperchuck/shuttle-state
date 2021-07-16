import React from 'react';
import { createState } from 'shuttle-state';

type Todo = {
  done: boolean;
  content: string;
};

const useTodoList = createState<Todo[]>([]);

const useContent = createState('');

export default function () {
  const [todoList, setTodoList, resetTodoList] = useTodoList();
  const [content, setContent, resetContent] = useContent();

  const addTodo = () => {
    if (!content || !content.trim().length) return;
    setTodoList([...todoList, { done: false, content }]);
    setContent('');
  };

  const changeTodo = (todo: Todo) => {
    setTodoList((state) =>
      state.map((item) => (item === todo ? { ...item, done: !item.done } : item)),
    );
  };

  const removeTodo = (todo: Todo) => {
    setTodoList((state) => state.filter((item) => item !== todo));
  };

  return (
    <div>
      <div>
        <input value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={addTodo}>submit</button>
        <button onClick={resetContent}>reset</button>
      </div>
      <ul>
        {todoList.map((todo, i) => (
          <li key={i} onClick={() => changeTodo(todo)}>
            <span
              style={{
                display: 'inline-block',
                width: 150,
                textDecoration: todo.done ? 'line-through' : 'none',
                color: todo.done ? 'green' : 'black',
              }}
            >
              {todo.content}
            </span>
            <button onClick={() => removeTodo(todo)}>remove</button>
          </li>
        ))}
      </ul>
      <button onClick={resetTodoList}>clear</button>
    </div>
  );
}
