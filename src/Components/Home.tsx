import React, { useState } from "react";
import { Timer } from "./Timer/Timer";

export const Home = () => {
  let [tasks, setTasks] = useState<any>([]);

  async function test() {
    const task = await window.electronAPI.getTask();
    console.log(task);

    if (task.length < 1) {
      setTasks("no tasks found");
    } else {
      setTasks(task);
    }
  }

  return (
    <div>
      <Timer />
      <h1
        onClick={() => {
          test();
        }}
      >
        click meh ples
      </h1>
      {tasks}
    </div>
  );
};
