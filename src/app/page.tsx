import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { redirect } from "next/navigation";

const sourceSerif = Source_Serif_4({ subsets: ["latin"] });

export default function Home() {
  redirect("/create");

  return (
    <div></div>
    // <div>
    //   <section
    //     id="top-bar"
    //     className="sticky z-20 top-0 w-full flex justify-between items-center px-6 py-4 bg-white/50 backdrop-blur-sm"
    //   >
    //     <div className="flex gap-4 items-center">
    //       <p className="text-xl font-medium">exquizite</p>
    //       <div className="hidden md:flex gap-1">
    //         <a href="#how-it-works">
    //           <Button variant={"link"} size={"sm"}>
    //             How it works
    //           </Button>
    //         </a>
    //         <a href="#features">
    //           <Button variant={"link"} size={"sm"}>
    //             Features
    //           </Button>
    //         </a>
    //         <a href="#use-cases">
    //           <Button variant={"link"} size={"sm"}>
    //             Use cases
    //           </Button>
    //         </a>
    //         <a href="#faq">
    //           <Button variant={"link"} size={"sm"}>
    //             FAQ
    //           </Button>
    //         </a>
    //       </div>
    //     </div>
    //     <div className="flex gap-4">
    //       <Link href="/login">
    //         <Button variant={"outline"}>Log in</Button>
    //       </Link>
    //       <Link href={"/create"}>
    //         <Button>Get started</Button>
    //       </Link>
    //     </div>
    //   </section>
    //   <div className="flex-grow w-full flex flex-col p-20 px-10 md:px-24 gap-40 divide-y">
    //     <section
    //       id="hero"
    //       className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 items-center"
    //     >
    //       <div className="flex flex-col gap-4 p-2">
    //         <h1
    //           className={
    //             "text-4xl sm:text-5xl font-bold text-balance " +
    //             sourceSerif.className
    //           }
    //         >
    //           Fast, Reliable Assessments in the Age of AI
    //         </h1>
    //         <p className="md:text-lg md:text-black/70 md:font-medium">
    //           Easily Create, Customize, and Grade High-Quality Assessments,
    //           Quizzes and Tests with AI-Powered Precision.
    //         </p>
    //         <Link href="/create">
    //           <Button size={"lg"}>
    //             Get started for free{" "}
    //             <IoIosArrowForward className="w-4 h-4 ml-1" />
    //           </Button>
    //         </Link>
    //       </div>
    //       <div className="bg-black/30 aspect-[3/2]"></div>
    //     </section>
    //     <section id="features" className="flex flex-col gap-10 pt-10">
    //       <h2
    //         className={
    //           "text-4xl font-bold text-center text-balance " +
    //           sourceSerif.className
    //         }
    //       >
    //         Powerful Features, Satisfying Experience
    //       </h2>
    //       <div className="flex flex-col gap-20">
    //         {features.map((feature) => (
    //           <div
    //             className="grid grid-cols-1 lg:grid-cols-2 bg-white drop-shadow-2xl rounded-xl overflow-clip"
    //             key={feature.name}
    //           >
    //             <div className="flex flex-col gap-4 p-8">
    //               <h3 className="text-2xl lg:text-3xl font-bold">
    //                 {feature.name}
    //               </h3>
    //               <p>{feature.description}</p>
    //             </div>
    //             <div className="bg-black/30 aspect-[3/2] lg:aspect-square"></div>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     <section id="how-it-works" className="flex flex-col gap-10 pt-10">
    //       <h2
    //         className={
    //           "text-4xl font-bold text-center text-balance " +
    //           sourceSerif.className
    //         }
    //       >
    //         A Fast, Smooth Process
    //       </h2>
    //       <div className="grid grid-cols-1 lg:grid-cols-2">
    //         {steps.map((step, index) => (
    //           <div className="flex flex-col gap-4 p-8 border border-black/10">
    //             <div className="flex w-10 h-10 font-bold items-center justify-center p-4 rounded-full border border-black">
    //               {index + 1}
    //             </div>
    //             <h3 className="text-2xl lg:text-3xl font-bold">{step.name}</h3>
    //             <p>{step.description}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //     <section id="use-cases" className="flex flex-col gap-10 pt-10">
    //       <h2
    //         className={
    //           "text-4xl font-bold text-center text-balance " +
    //           sourceSerif.className
    //         }
    //       >
    //         Built for Educators, Professionals, and Everyone in Between
    //       </h2>
    //       <Tabs defaultValue={useCases[0].id}>
    //         <div className="flex-auto">
    //           {useCases.map((useCase) => (
    //             <TabsList className="bg-transparent">
    //               <TabsTrigger
    //                 value={useCase.id}
    //                 className="border-2 rounded-full"
    //               >
    //                 {useCase.name}
    //               </TabsTrigger>
    //             </TabsList>
    //           ))}
    //         </div>
    //         <div>
    //           {useCases.map((useCase) => (
    //             <TabsContent value={useCase.id}>
    //               <div className="grid grid-cols-1 lg:grid-cols-2 lg:py-6 gap-4">
    //                 <h3 className="text-xl font-medium lg:text-2xl pt-8">
    //                   {useCase.desription}
    //                 </h3>
    //                 <div className="bg-black/30 aspect-[3/2]"></div>
    //               </div>
    //             </TabsContent>
    //           ))}
    //         </div>
    //       </Tabs>
    //     </section>
    //     <section id="faq" className="flex flex-col gap-10 pt-10">
    //       <h2
    //         className={
    //           "text-4xl font-bold text-center text-balance " +
    //           sourceSerif.className
    //         }
    //       >
    //         Frequently Asked Questions
    //       </h2>
    //       <div>
    //         <Accordion type="single" collapsible className="max-w-md mx-auto">
    //           {faqs.map((faq) => (
    //             <AccordionItem value={faq.question}>
    //               <AccordionTrigger className="text-left ">
    //                 {faq.question}
    //               </AccordionTrigger>
    //               <AccordionContent>{faq.answer}</AccordionContent>
    //             </AccordionItem>
    //           ))}
    //         </Accordion>
    //       </div>
    //       <div className="max-w-md flex flex-col items-center mx-auto gap-4">
    //         <p className="text-xl lg:text-2xl">Have any other questions?</p>
    //         <Button variant={"outline"}>Contact us</Button>
    //       </div>
    //       <div className="flex flex-col gap-4 pt-10 items-center max-w-lg mx-auto border-t">
    //         <h2
    //           className={
    //             "text-4xl font-bold text-center " + sourceSerif.className
    //           }
    //         >
    //           Start Creating Smarter Assessments Today
    //         </h2>

    //         <Link href="/create">
    //           <Button size={"lg"}>
    //             Get started for free{" "}
    //             <IoIosArrowForward className="w-4 h-4 ml-1" />
    //           </Button>
    //         </Link>
    //       </div>
    //     </section>
    //   </div>
    // </div>
  );
}

const features = [
  {
    name: "Intelligent Content Understanding",
    description:
      "Our advanced AI doesn’t just skim through your uploads...It deeply analyzes your notes, documents, and resources to extract key concepts and themes",
  },
  {
    name: "Instant Question and Answer Generation",
    description:
      "AI-powered question generation from your documents means you can create quizzes and tests faster and more efficiently. Get accurate, well-formulated questions for any topic",
  },
  {
    name: "Flexible Customization Options",
    description:
      "Our intuitive editor lets you refine questions to ensure they’re just right. Edit, regenerate, or improve any questions and answers with ease",
  },
  {
    name: "Effortless Exporting & Sharing",
    description:
      "Export assessments in multiple formats (PDF, DOCX) for convenient sharing. You can also publish assessments for others to complete directly on the platform",
  },
  {
    name: "Smart Grading Options",
    description:
      "Choose between grading submissions yourself or using AI-assisted grading to save time and ensure accuracy",
  },
];

const steps = [
  {
    name: "Bring your Resources",
    description:
      "Upload any relevant notes, documents, or PDFs. Our system can handle various formats, so you don’t have to start from scratch",
  },
  {
    name: "Get High-Quality Questions & Answers",
    description:
      "Let our AI analyze your content and instantly generate thoughtfully crafted questions and answers tailored to the subject matter. No more hours spent creating questions manually",
  },
  {
    name: "Customize & Export",
    description:
      "Fine-tune the generated questions to meet your exact requirements. Add new questions, regenerate ones you’d like improved, and then export as a PDF or DOCX file",
  },
  {
    name: "Publish & Grade",
    description:
      "Publish your assessment for others to access and complete. Review submissions at your convenience and choose to grade manually or let the AI do it for you",
  },
];

const useCases = [
  {
    id: "educators",
    name: "Educators",
    desription:
      "Streamline quiz and exam creation, allowing more time to focus on what matters: teaching",
  },
  {
    id: "trainers",
    name: "Corporate Trainers",
    desription:
      "Quickly create assessments to evaluate employee knowledge and track progress in real time",
  },
  {
    id: "recruiters",
    name: "Interviewers and Recruiters",
    desription:
      "Easily generate assessment tests to evaluate candidate skills and understanding, with customizable grading options",
  },
  {
    id: "assessors",
    name: "Assessors and Certification Bodies",
    desription:
      "Use your existing documents to quickly generate assessment questions for certification exams, saving hours on content preparation",
  },
];

const faqs = [
  {
    question: "What types of files can I upload?",
    answer:
      "You can upload files in PDF, DOCX (Microsoft Word), or PPTX (PowerPoint) formats.",
  },
  {
    question: "How accurate are the AI-generated questions?",
    answer:
      "Our AI is designed to provide questions and answers that reflect the key themes and concepts in your materials. While the AI is highly accurate, you have full control to edit and refine any questions to meet your exact standards.",
  },
  {
    question: " Can I choose how my assessments are graded?",
    answer:
      "Yes! You can review and grade submissions manually or let our AI handle the grading for you. AI grading is designed to be quick and reliable, but you always have the option to make adjustments or review grades yourself.",
  },
  {
    question: "Can others access my published assessments?",
    answer:
      "When you choose to publish an assessment, it becomes accessible to others who have the link to it. This makes it easy to share assessments with students, candidates, or colleagues for them to complete and submit.",
  },
];
