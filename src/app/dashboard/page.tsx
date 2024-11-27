import { CreateServerClient } from "@/utils/supabase/serverClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { getAllUserAssessments } from "../api/assessments/fetch/getAllUserAssessments";
import Image from "next/image";
import AccountDropdown from "../components/accountDropdown";
import Footer from "../footer";

export default async function Assessments() {
  const supabase = CreateServerClient();
  const authenticatedUser = await supabase.auth
    .getUser()
    .then((user) => user.data.user);

  if (!authenticatedUser) {
    redirect("/login?redirect=/dashboard");
  }

  const allUserAssessments = await getAllUserAssessments();

  return (
    <div>
      <div className="px-5 py-2 flex items-center justify-between border-b border-black/30">
        <Link href={"/dashboard"}>
          <Image
            src={"/logo.svg"}
            width={144}
            height={40}
            className="w-36 h-10"
            alt="logo"
          />
        </Link>
        <AccountDropdown user={authenticatedUser} />
      </div>
      <div className="w-full max-w-lg flex justify-between items-center p-5 mx-auto">
        <p className="text-2xl font-bold">All assessments</p>
        <Link href={"/create"}>
          <Button>
            <span>
              <FiPlus className="w-5 h-5 mr-2" />
            </span>
            New
          </Button>
        </Link>
      </div>

      {allUserAssessments ? (
        allUserAssessments.length === 0 ? (
          <p className="min-h-screen text-center font-medium p-4 py-20">
            You have not created any assessments...yet
          </p>
        ) : (
          <div className="min-h-screen flex flex-col divide-y divide-black/10 max-w-lg mx-auto">
            {allUserAssessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/dashboard/${assessment.nanoId}`}
                className="w-full flex flex-col gap-1 p-5 rounded-md hover:bg-black/5"
              >
                <p className="max-w-full truncate">{assessment.title}</p>
                <p className="text-sm text-black/70">
                  {assessment.submissions.length} submission
                  {assessment.submissions.length === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div>
          <p>
            There was an error while fetching your assessments. Try refreshing
            this page.
          </p>
        </div>
      )}
      <Footer />
    </div>
  );
}
