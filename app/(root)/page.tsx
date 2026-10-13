import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/app/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

const HomePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id, limit: 6 }),
  ]);

  const hasPastInterviews = userInterviews.length > 0;
  const hasUpcomingInterviews = latestInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-8 max-w-lg">
          <h2>Get Interview-Ready with AI powered preparation</h2>
          <p className="text-lg">
            Practice coding problems, behavioral questions, and receive
            personalized feedback to ace your next interview.
          </p>
          <Button className="max-sm:w-full btn-primary" asChild>
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
          {hasUpcomingInterviews ? (
            latestInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            <p>There are no new interviews available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
