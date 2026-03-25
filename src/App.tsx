import { useReducer, useEffect, useState } from "react";

type ColumnType = "todo" | "inprogress" | "done";

interface Task {
  id: string;
  title: string;
  description: string;
}

interface State {
  columns: Record<ColumnType, Task[]>;
}

type Action =
  | { type: "ADD"; payload: Task }
  | { type: "DELETE"; payload: { column: ColumnType; id: string } }
  | { type: "MOVE"; payload: { from: ColumnType; to: ColumnType; id: string } }
  | { type: "LOAD"; payload: State };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "LOAD":
      return action.payload;

    case "ADD":
      return {
        ...state,
        columns: {
          ...state.columns,
          todo: [...state.columns.todo, action.payload],
        },
      };

    case "DELETE":
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.payload.column]: state.columns[
            action.payload.column
          ].filter((t) => t.id !== action.payload.id),
        },
      };

    case "MOVE": {
      const task = state.columns[action.payload.from].find(
        (t) => t.id === action.payload.id
      );
      if (!task) return state;

      return {
        ...state,
        columns: {
          ...state.columns,
          [action.payload.from]: state.columns[
            action.payload.from
          ].filter((t) => t.id !== action.payload.id),
          [action.payload.to]: [
            ...state.columns[action.payload.to],
            task,
          ],
        },
      };
    }

    default:
      return state;
  }
};

const initialState: State = {
  columns: {
    todo: [],
    inprogress: [],
    done: [],
  },
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem("kanban");
      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed.columns &&
          parsed.columns.todo &&
          parsed.columns.inprogress &&
          parsed.columns.done
        ) {
          dispatch({ type: "LOAD", payload: parsed });
        }
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // SAVE to localStorage (after load only)
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("kanban", JSON.stringify(state));
    }
  }, [state, loaded]);

  const addTask = () => {
    if (!title.trim()) return;

    dispatch({
      type: "ADD",
      payload: {
        id: Date.now().toString(),
        title,
        description: desc,
      },
    });

    setTitle("");
    setDesc("");
  };

  const nextColumn = (col: ColumnType): ColumnType => {
    if (col === "todo") return "inprogress";
    if (col === "inprogress") return "done";
    return "todo";
  };

  const columns = [
    { key: "todo", label: "To Do" },
    { key: "inprogress", label: "In Progress" },
    { key: "done", label: "Done" },
  ] as { key: ColumnType; label: string }[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-200 to-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 tracking-wide">
        Flow Kanban Board
      </h1>

      {/* Add Task */}
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto mb-10 border border-gray-200">
        <input
          className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 mb-3 rounded-lg"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 mb-4 rounded-lg"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button
          onClick={addTask}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold"
        >
          Add Task
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col.key}
            className="bg-white p-5 rounded-2xl shadow-md border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex justify-between">
              {col.label}
              <span className="bg-gray-200 text-sm px-2 py-1 rounded">
                {state.columns[col.key].length}
              </span>
            </h2>

            {state.columns[col.key].length === 0 && (
              <p className="text-gray-400 text-sm italic">
                No tasks in this column
              </p>
            )}

            {state.columns[col.key].map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-800">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {task.description}
                </p>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      dispatch({
                        type: "DELETE",
                        payload: { column: col.key, id: task.id },
                      })
                    }
                    className="text-red-500 hover:text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() =>
                      dispatch({
                        type: "MOVE",
                        payload: {
                          from: col.key,
                          to: nextColumn(col.key),
                          id: task.id,
                        },
                      })
                    }
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    Move →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}