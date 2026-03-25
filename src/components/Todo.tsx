import { Todo as TodoType } from "../types";

interface Props {
  todo: TodoType;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function Todo({ todo, onDelete, onToggle }: Props) {
  return (
    <div className="flex justify-between items-center bg-white p-3 rounded shadow mb-2">
      <span
        onClick={() => onToggle(todo.id)}
        className={`cursor-pointer ${
          todo.completed ? "line-through text-gray-400" : ""
        }`}
      >
        {todo.text}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        className="text-red-500"
      >
        Delete
      </button>
    </div>
  );
}