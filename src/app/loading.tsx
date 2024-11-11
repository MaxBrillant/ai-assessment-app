import { RiLoader3Fill } from "react-icons/ri";
export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white opacity-30">
      <RiLoader3Fill className="w-20 h-20 animate-spin" />
    </div>
  );
}
