import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

const FeedbackPage = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  // No feedback yet: send the user to take the interview first.
  if (!feedback) redirect(`/interview/${id}`);

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold text-center">
          Feedback on the Interview:{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5 max-sm:flex-col max-sm:items-center">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {feedback.totalScore}
              </span>
              /100
            </p>
          </div>

          <div className="flex flex-row gap-2 items-center">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>{dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}</p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback.finalAssessment}</p>

      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback.categoryScores.map((category, index) => (
          <div key={category.name}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul className="list-disc pl-6">
          {feedback.strengths.map((strength) => (
            <li key={strength}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul className="list-disc pl-6">
          {feedback.areasForImprovement.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1" asChild>
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1" asChild>
          <Link href={`/interview/${id}`} className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default FeedbackPage;
