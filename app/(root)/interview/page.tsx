import { getCurrentUser } from "@/lib/actions/auth.action";
import Agent from "@/app/components/Agent"; 
const Page = async () => {

  const user = await getCurrentUser();
  return (
    <div>
      <h3>Interview Generation</h3>
      {user && (
        <Agent 
          userName={user.name} 
          userId={user.id} 
          type="generate" 
        />
      )}
    </div>
  )
}

export default Page;