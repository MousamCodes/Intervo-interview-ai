import dayjs from 'dayjs'
import Image from 'next/image'
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DisplayTechicons from '@/components/ui/DisplayTechicons';


const InterviewCard = ({interviewId, userId, role, type, techstack, createdAt}: InterviewCardProps)=>{
const feedback = null as Feedback | null;
const normalisedType = /mix/gi.test(type)
? 'Mixed': type;
const formattedDate = dayjs(feedback?.createdAt || createdAt|| Date.now()).format('MMM D, YYYY');

  return (
    <div className="card-border max-sm:w-full min-h-96 relative flex flex-col">
      <div className="card-interview">
        <div className="relative">
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-60 ">
            <p className="badge-text">{normalisedType}</p>
          </div>
          <Image src={getRandomInterviewCover()} alt="interview cover" width={90} height={90} className="rounded-lg object-fit size-[90px]" />

          <h3 className="mt-5 capitalize">
            {role} Interview
          </h3>
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image src="/calendar.svg" alt="calendar icon" width={22} height={22} />
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="tech stack icon" width={22} height={22} />
              <p>{feedback?.totalScore ||'---'}/100
              </p>
            </div>
          </div>
          <div>
          <p className="line-clamp-2 mt-5">{feedback?.finalAssessment || 'No feedback yet. Take the interview to receive personalized feedback and insights to help you improve.'}

          </p>
          </div>
          
          <div className="flex flex-row justify-between items-center mt-auto pt-6">
            <DisplayTechicons techStack={techstack}/>

            <Button className="btn-primary">
               <Link href={feedback ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`}>
                  {feedback ? 'View Feedback' : 'View Interview'}
                </Link>
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard