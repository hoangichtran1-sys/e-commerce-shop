import { requireAuth } from "@/lib/auth-utils"

const Page = async () => {
  await requireAuth()
  return (
    <div className=''>Customer Page</div>
  )
}

export default Page
