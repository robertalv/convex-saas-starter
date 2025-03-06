import InviteUsersModal from "@/components/modals/invite-users-modal";
import { Button } from "@workspace/ui/components/button";

const Topbar = () => {
  return (
    <div className='h-10 border-b w-full flex items-center px-1'>
      <div className="ml-auto">
        <InviteUsersModal
          trigger={
            <Button className="h-8 border-none" variant={"outline"}>
              Invite Users
            </Button>
          }
        />
      </div>

    </div>
  )
}

export default Topbar;