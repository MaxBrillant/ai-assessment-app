"use client";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from "react";

type timerPropsType = {
  assessmentCreationTime: Date;
  assessmentDuration: number;
  submissionStatus: "pending-submission" | "submitted" | "resubmission-allowed";
};

const getRemainingTime = (creationTime: Date, duration: number) => {
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - creationTime.getTime();
  const remainingTime = duration - Math.floor(timeDifference / 1000);
  return remainingTime > 0 ? remainingTime : 0;
};
const CountdownTimer = (props: timerPropsType) => {
  const [remainingTime, setRemainingTime] = useState(
    getRemainingTime(props.assessmentCreationTime, props.assessmentDuration)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (remainingTime <1) {
        if(props.submissionStatus !== "submitted"){
          
        }
        clearInterval(intervalId)
      }else{
      setRemainingTime((prevTime: number) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
      minutes !== 1 ? "s" : ""
    } ${seconds} second${seconds !== 1 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-col items-center hey max-w-md">
      <p>Time remaining: {formatTime(remainingTime)}</p>
      <Progress
        value={(remainingTime * 100) / props.assessmentDuration}
      ></Progress>
    </div>
  );
};

export default CountdownTimer;
