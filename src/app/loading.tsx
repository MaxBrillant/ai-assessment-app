import Image from "next/image";
import { ReactNode } from "react";
import { RiLoader3Fill } from "react-icons/ri";
export default function Loading(props: { message?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 pointer-events-none z-[9999] backdrop-blur-sm">
      <Image src="/loading.gif" width={400} height={100} alt="loading" />
      {props.message && (
        <p className="text-lg font-medium p-8 text-center">{props.message}</p>
      )}
    </div>
  );
}
