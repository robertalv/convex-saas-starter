"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { useAction } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { PlusIcon, Copy, X, CopyIcon } from "lucide-react"
import { useOrganization } from "@/hooks/use-organization"
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog"
import { useRefreshJoinCode } from "@/hooks/use-refresh-join-code"

interface InviteUsersModalProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

interface InviteUserData {
  email: string | undefined;
  role: string | undefined;
}

export default function InviteUsersModal({
  trigger,
  onSuccess
}: InviteUsersModalProps) {
  const inviteUserAction = useAction(api.users.inviteUserAction)
  const { mutate: refreshJoinCode, isLoading } = useRefreshJoinCode();
  const { organization } = useOrganization()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invitations, setInvitations] = useState<InviteUserData[]>([
    { email: "", role: "org:member" }
  ])

  const handleAddAnotherEmail = () => {
    setInvitations([...invitations, { email: "", role: "org:member" }])
  }

  const handleRemoveEmail = (index: number) => {
    if (invitations.length === 1) return
    setInvitations(invitations.filter((_, i) => i !== index))
  }

  const handleEmailChange = (index: number, email: string) => {
    const updatedInvitations = [...invitations]
    updatedInvitations[index] = {
      email,
      role: updatedInvitations[index]?.role
    }
    setInvitations(updatedInvitations)
  }

  const handleRoleChange = (index: number, role: string) => {
    const updatedInvitations = [...invitations]
    updatedInvitations[index] = {
      email: updatedInvitations[index]?.email,
      role
    }
    setInvitations(updatedInvitations)
  }

  const handleInviteUsers = async () => {
    if (!organization?._id) {
      toast.error("Organization not found")
      return
    }

    const validInvitations = invitations
      .filter(invite => invite.email?.trim() !== "")
      .map(invite => ({
        email: invite.email as string,
        role: invite.role || "org:member"
      }));

    if (validInvitations.length === 0) {
      toast.error("Please enter at least one email address")
      return
    }

    setIsSubmitting(true)

    try {
      await inviteUserAction({
        invitations: validInvitations,
      })

      toast.success(`${validInvitations.length} user${validInvitations.length > 1 ? 's were' : ' was'} invited to your organization.`)

      setInvitations([{ email: "", role: "org:member" }])
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error inviting users:", error)
      toast.error("Failed to send invitations. Please try again.")
    } finally {
      setInvitations([{ email: "", role: "org:member" }])
      setIsSubmitting(false)
      setOpen(false)
    }
  }

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/organization/join/${organization?._id}`;
    navigator.clipboard.writeText(inviteLink).then(() => toast.success('Invite link copied to clipboard'));
  }

  const handleCopyCode = () => {
    const code = organization?.joinCode;
    if (code) {
      navigator.clipboard.writeText(code).then(() => toast.success('Code copied to clipboard'));
    } else {
      toast.error('No code available to copy');
    }
  }

  const handleRefreshJoinCode = () => {
    if (!organization) return;

    refreshJoinCode({
      orgId: organization._id
    }, {
      onSuccess: () => {
        console.log("Refreshing join code...")
      },
      onError: (error) => {
        toast.error('Error refreshing join code');
      },
      onFinally: () => {
        toast.success('Join code refreshed');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite users by email or join code</DialogTitle>
          <DialogDescription>
            We can either invite users by email or by sharing the join code with your teammates.
          </DialogDescription>
        </DialogHeader>

        <div className={'flex flex-col space-y-2 items-center justify-center py-6 dark:bg-zinc-900 bg-zinc-200'}>
          <span className={'text-sm text-zinc-400'}>
            Share this code with your teammates to invite them to your organization.
          </span>
          <div className={'flex flex-row items-center justify-center gap-x-2'}>
            <span className={'tracking-widest uppercase text-4xl font-bold'}>
              {organization?.joinCode}
            </span>
            <Button
              className={"size-8 bg-transparent hover:bg-accent/50"}
              onClick={handleCopyCode}
            >
              <CopyIcon className="text-accent-foreground" />
            </Button>
          </div>
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className='text-xs px-2'
                  size='sm'
                  variant='ghost'
                  disabled={isLoading}
                >
                  Refresh Code
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    If you refresh the code, the current code will be invalidated.
                    Anyone who has the current code will not be able to use it to join the workspace.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefreshJoinCode}>Refresh Code</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>

        <div className="py-4 space-y-2">
          {invitations.map((invitation, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <label htmlFor={`email-${index}`} className="sr-only">Email</label>
                <Input
                  id={`email-${index}`}
                  value={invitation.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="Email"
                  type="email"
                />
              </div>

              <div className="w-[110px]">
                <Select
                  value={invitation.role}
                  onValueChange={(value) => handleRoleChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="org:admin">Admin</SelectItem>
                    <SelectItem value="org:member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveEmail(index)}
                disabled={invitations.length === 1}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  invitations.length === 1 && "hidden"
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            className="flex items-center text-xs text-primary hover:text-primary/80"
            onClick={handleAddAnotherEmail}
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add another email
          </Button>

          <div className="flex justify-between pt-4 gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>

            <Button
              onClick={handleInviteUsers}
              disabled={isSubmitting}
              className="flex-1"
            >
              Invite Users
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
