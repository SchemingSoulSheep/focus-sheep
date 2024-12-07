import React, { useState } from "react";
import "./Timer.css";

export const Timer = () => {
  let [minutes, setMinutes] = useState(0);
  let [hours, setHours] = useState(0);
  let [seconds, letSeconds] = useState(0);

  return (
    <div>
      <div className="timer-wrapper">
        <div>
          {" "}
          <h1>Timer </h1>
        </div>
        <div className="timer-text">
          <div className="text-wrapper">
            <h1>{hours}</h1>
            <h1>:</h1>
            <h1>{minutes}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
