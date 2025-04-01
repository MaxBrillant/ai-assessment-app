import { Source_Serif_4 } from "next/font/google";
import PricingOptions from "./pricingOptions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreateServerClient } from "@/utils/supabase/serverClient";
import Footer from "../footer";
import TopBar from "../components/topBar";
import FeedbackDialog from "../components/feedbackDialog";

const sourceSerif = Source_Serif_4({ subsets: ["latin"] });
export default async function Pricing() {
  const user = (await CreateServerClient().auth.getUser()).data.user;
  return (
    <div>
      <TopBar />
      <div className="flex flex-col gap-8 items-center py-10">
        <h1
          className={
            "text-4xl sm:text-5xl font-bold text-balance " +
            sourceSerif.className
          }
        >
          Pricing
        </h1>
        <h3 className="max-w-3xl text-center px-8 font-normal text-black/70">
          Quizdom offers free credits for new users to explore and experience
          all features we have to offer. Once your free credits are used, you
          can easily top up to keep creating assessments, grading submissions,
          and more.
        </h3>
        <PricingOptions user={user} mode={"newUser"} />

        <div className="flex flex-col gap-4 my-8">
          <h2
            className={
              "text-4xl font-bold text-center text-balance " +
              sourceSerif.className
            }
          >
            Frequently Asked Questions
          </h2>
          <div>
            <Accordion
              type="single"
              collapsible
              className="max-w-md mx-auto p-4"
            >
              {faqs.map((faq) => (
                <AccordionItem value={faq.question} key={faq.question}>
                  <AccordionTrigger className="text-left ">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      <div className="fixed right-4 bottom-4 z-50">
        <FeedbackDialog />
      </div>
      <Footer />
    </div>
  );
}

const faqs = [
  {
    question: "What are credits and how do they work?",
    answer:
      "Credits are the units used on Quizdom to generate questions, answers, and grade submissions using AI. Each action, such as generating a question or creating a full assessment, consumes a specific number of credits. You start with free credits as a new user, and additional credits can be purchased as needed to continue.",
  },
  {
    question:
      "How many credits do I need to generate a question or assessment?",
    answer:
      "The number of credits required depends on the action. For example, generating a single question may cost 1 credit, while creating a full assessment might cost more. Specific credit usage details are provided in your account dashboard.",
  },
  {
    question: "What happens when I run out of credits?",
    answer:
      "You can purchase additional credits at any time to continue using the platform. If you run out during a task, you’ll be prompted to top up.",
  },
  {
    question: "Can I carry over unused credits to the next month?",
    answer:
      "Yes, any unused credits will automatically roll over to the next month, ensuring you don’t lose the credits you’ve already paid for.",
  },
  {
    question: "How can I check my remaining credits?",
    answer:
      "You can view your remaining credits in your account dashboard, which provides real-time updates on your credit balance.",
  },
];
