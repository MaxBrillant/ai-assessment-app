"use client";
import { Progress } from "@/components/ui/progress";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { submitAssessment } from "../api/submissions/mutations";

type timerPropsType = {
  id: number;
  assessmentCreationTime: Date;
  assessmentDuration: number;
  submissionStatus:
    | "pending-submission"
    | "submitted"
    | "resubmission-allowed"
    | "graded";
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
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const endAssessment = async () => {
      try {
        await submitAssessment(props.id);
        setTimeUp(true);
      } catch (e) {
        console.log("Error while submitting the assessment");
      }
    };
    if (remainingTime === 0) {
      if (props.submissionStatus !== "submitted") {
        endAssessment();
      }
    }
  }, [remainingTime]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (remainingTime < 1) {
        clearInterval(intervalId);
      } else {
        setRemainingTime((prevTime: number) =>
          prevTime > 0 ? prevTime - 1 : 0
        );
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    const hoursString = hours > 0 ? `${hours} hr.` : "";
    const minutesString = minutes > 0 ? `${minutes} min.` : "";
    const secondsString = `${seconds} sec.`;

    return [hoursString, minutesString, secondsString]
      .filter((str) => str !== "")
      .join(" ");
  };

  return (
    <div className="flex flex-col items-center">
      <Dialog open={timeUp}>
        <DialogContent>
          <p className="text-2xl font-bold">Time is up!</p>
          <p>
            Thank you for taking this assessment. It will be automatically
            submitted for you
          </p>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col w-full items-center bg-black/5 border rounded-md mt-2">
        <p
          className={`${
            (remainingTime === props.assessmentDuration * 0.1 ||
              remainingTime === props.assessmentDuration * 0.25 ||
              remainingTime === props.assessmentDuration * 0.5 ||
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(remainingTime)) &&
            "text-red-500 font-bold animate-bounce duration-300"
          } text-lg font-medium mx-2 my-1`}
        >
          {formatTime(remainingTime)}{" "}
          <span className="text-xs text-black/70">remaining</span>
        </p>
        <Progress
          className="w-full"
          value={(remainingTime * 100) / props.assessmentDuration}
        ></Progress>
      </div>
    </div>
  );
};

export default CountdownTimer;
