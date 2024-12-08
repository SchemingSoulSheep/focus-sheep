import React, { useState } from "react";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "./Timer.css";

export const Timer = () => {
  let [minutes, setMinutes] = useState(0);
  let [hours, setHours] = useState(0);
  let [seconds, letSeconds] = useState(0);
  const percentage = 66;
  return (
    <div>
      <div className="timer-wrapper">
        <div>
          <h1>Timer&nbsp;</h1>
        </div>
        <CircularProgressbar value={percentage} text={`${percentage}%`} />;
      </div>
    </div>
  );
};
