import { RiLoader2Fill, RiLoader5Line } from "react-icons/ri";
import { TbLoaderQuarter } from "react-icons/tb";
export default function Loading(props: { message?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 pointer-events-none z-[90] backdrop-blur-sm">
      <RiLoader5Line className="w-20 h-20 animate-spin duration-500 opacity-70 fill-primaryRed" />
      {props.message && (
        <p className="text-lg font-medium p-8 text-center">{props.message}</p>
      )}
    </div>
  );
}
