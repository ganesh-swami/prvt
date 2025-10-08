import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function Page() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const getTodos = async () => {
      console.log("getTodos");
      const { data: todos } = await supabase.from("Temp").select();
      console.log(todos);

      if (todos.length > 1) {
        setTodos(todos);
      }
    };

    getTodos();
  }, []);

  return (
    <div>
      <h1>hhhhhhhhhhhhhhhhhhhh</h1>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.test}</li>
      ))}
    </div>
  );
}
export default Page;
