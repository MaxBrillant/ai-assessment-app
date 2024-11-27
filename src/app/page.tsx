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
import Image from "next/image";
import HamburgerMenu from "./components/hamburgerMenu";
import Footer from "./footer";
import TopBar from "./components/topBar";

const sourceSerif = Source_Serif_4({ subsets: ["latin"] });

export default function Home() {
  return (
    <div>
      <div className="absolute z-[-10] h-[80vh] w-full bg-gradient-to-b from-primaryRed/10  via-primaryOrange/10 to-background"></div>
      <TopBar />
      <div className="flex-grow w-full flex flex-col p-20 px-10 md:px-24 gap-40 divide-y">
        <section id="hero" className="w-full max-w-2xl flex flex-col gap-6">
          <h1
            className={
              "text-4xl sm:text-5xl font-bold text-balance " +
              sourceSerif.className
            }
          >
            Fast, Reliable Assessments in the Age of AI
          </h1>
          <p className="md:text-lg text-black/70 md:font-medium">
            Easily Create, Customize, and Grade High-Quality Assessments,
            Quizzes and Tests with AI-Powered Precision.
          </p>
          <Link href="/create" className="w-fit">
            <Button size={"lg"}>
              Get started for free{" "}
              <IoIosArrowForward className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </section>
        <section id="features" className="flex flex-col gap-10 pt-10">
          <h2
            className={
              "text-4xl font-bold text-center text-balance " +
              sourceSerif.className
            }
          >
            {`Assessments can be tedious and flawed... but we're here to change
            that.`}
          </h2>
          <div className="flex flex-col gap-20">
            {features.map((feature) => (
              <div
                className="grid grid-cols-1 lg:grid-cols-2 bg-white drop-shadow-2xl rounded-xl overflow-clip"
                key={feature.name}
              >
                <div className="flex flex-col gap-4 p-8">
                  <h3 className="text-2xl lg:text-3xl font-bold">
                    {feature.name}
                  </h3>
                  <p>{feature.description}</p>
                </div>
                <div className="bg-white aspect-[1/1] lg:aspect-square p-6">
                  <Image
                    src={feature.url}
                    alt={feature.name}
                    width={1280}
                    height={1280}
                    className="w-full h-full object-cover rounded-xl border border-black/30 shadow-2xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="flex flex-col gap-10 pt-10">
          <h2
            className={
              "text-4xl font-bold text-center text-balance " +
              sourceSerif.className
            }
          >
            A Fast, Smooth Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 p-8 border border-black/10"
              >
                <div className="flex w-10 h-10 font-bold items-center justify-center p-4 rounded-full border border-black">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold">{step.name}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="use-cases" className="flex flex-col gap-10 pt-10">
          <h2
            className={
              "text-4xl font-bold text-center text-balance " +
              sourceSerif.className
            }
          >
            Built for Educators, Professionals, and Everyone in Between
          </h2>
          <Tabs defaultValue={useCases[0].id}>
            <div className="flex-auto">
              {useCases.map((useCase) => (
                <TabsList className="bg-transparent" key={useCase.id}>
                  <TabsTrigger
                    value={useCase.id}
                    className="border-2 rounded-full"
                  >
                    {useCase.name}
                  </TabsTrigger>
                </TabsList>
              ))}
            </div>
            <div>
              {useCases.map((useCase) => (
                <TabsContent value={useCase.id} key={useCase.id}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 lg:py-6 gap-4">
                    <div>
                      <h3 className="text-xl font-medium lg:text-2xl pt-8 text-black/70 text-balance">
                        {useCase.desription}
                      </h3>
                      <Link href={"/create"}>
                        <Button
                          variant={"link"}
                          size={"lg"}
                          className="p-0 py-4 mt-4 underline underline-offset-8 hover:text-primaryRed"
                        >
                          Get started now{" "}
                          <IoIosArrowForward className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="bg-black/30 aspect-[3/2]">
                      <Image
                        src={useCase.url}
                        alt={useCase.name}
                        width={1280}
                        height={1280}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </section>
        <section id="faq" className="flex flex-col gap-10 pt-10">
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
          <div className="max-w-md flex flex-col items-center mx-auto gap-4">
            <h3 className="text-xl font-medium lg:text-2xl pt-8 text-black/70 text-center">
              Have any other questions?
            </h3>
            <a href="mailto:support@getquizdom.com">
              <Button variant={"outline"}>Contact us</Button>
            </a>
          </div>
          <div className="flex flex-col gap-4 pt-10 items-center max-w-lg mx-auto border-t">
            <h2
              className={
                "text-4xl font-bold text-center " + sourceSerif.className
              }
            >
              Start Creating Smarter Assessments Today
            </h2>

            <Link href="/create">
              <Button size={"lg"}>
                Get started for free{" "}
                <IoIosArrowForward className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

const features = [
  {
    name: "Intelligent Content Understanding",
    description:
      "Our advanced AI doesn’t just skim through your uploads...It deeply analyzes your notes, documents, and resources to extract key concepts and themes.",
    url: "/feature1.webp",
  },
  {
    name: "Instant Question and Answer Generation",
    description:
      "AI-powered question generation from your documents means you can create quizzes and tests faster and more efficiently. Get accurate, well-formulated questions for any topic.",
    url: "/feature2.webp",
  },
  {
    name: "Flexible Customization Options",
    description:
      "Our intuitive editor lets you refine questions to ensure they’re just right. Edit, regenerate, or improve any questions and answers with ease.",
    url: "/feature3.webp",
  },
  {
    name: "Effortless Exporting & Sharing",
    description:
      "Export in multiple formats (PDF, DOCX) for convenient sharing, or publish directly on the platform for others to complete.",
    url: "/feature4.webp",
  },
  {
    name: "Smart Grading Options",
    description:
      "Choose between grading submissions yourself or using AI-assisted grading to save time and ensure accuracy.",
    url: "/feature5.webp",
  },
];

const steps = [
  {
    name: "Bring your Resources",
    description:
      "Upload any relevant notes, documents, or PDFs. Our system can handle various formats, so you don’t have to start from scratch.",
  },
  {
    name: "Get High-Quality Questions & Answers",
    description:
      "Let our AI analyze your content and instantly generate thoughtfully crafted questions and answers tailored to the subject matter. No more hours spent creating questions manually.",
  },
  {
    name: "Customize & Export",
    description:
      "Fine-tune the generated questions to meet your exact requirements. Add new questions, regenerate ones you’d like improved, and then export as a PDF or DOCX file.",
  },
  {
    name: "Publish & Grade",
    description:
      "Publish your assessment for others to access and complete. Review submissions at your convenience and choose to grade manually or let the AI do it for you.",
  },
];

const useCases = [
  {
    id: "educators",
    name: "Educators",
    desription:
      "Create quizzes and exams effortlessly, so you can spend more time doing what really matters: teaching.",
    url: "/teacher.webp",
  },
  {
    id: "trainers",
    name: "Corporate Trainers",
    desription:
      "Quickly create assessments to evaluate employee knowledge and track progress in real time.",
    url: "/corporate.webp",
  },
  {
    id: "recruiters",
    name: "Interviewers and Recruiters",
    desription:
      "Easily generate tests to evaluate candidate skills and understanding, with customizable grading options.",
    url: "/recruiter.webp",
  },
  {
    id: "assessors",
    name: "Assessors and Certification Bodies",
    desription:
      "Use your existing documents to quickly generate questions for certification exams, saving hours on content preparation.",
    url: "/certification.webp",
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
    question: "Can I choose how my assessments are graded?",
    answer:
      "Yes! You can review and grade submissions manually or let our AI handle the grading for you. AI grading is designed to be quick and reliable, but you always have the option to make adjustments or review grades yourself.",
  },
  {
    question: "Can others access my published assessments?",
    answer:
      "When you choose to publish an assessment, it becomes accessible to others who have the link to it. This makes it easy to share assessments with students, candidates, or colleagues for them to complete and submit.",
  },
];
