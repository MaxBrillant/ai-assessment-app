"use client";
import { RiLoader5Line } from "react-icons/ri";
export default function Loading(props: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <RiLoader5Line className="w-20 h-20 animate-spin duration-500 opacity-70 fill-primaryRed" />
      {props.message && (
        <p className="text-lg font-medium p-8 text-center">{props.message}</p>
      )}
    </div>
  );
}
