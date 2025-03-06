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
import { OrgFormData } from "@/types"
import OrganizationForm from "../forms/organization-form"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Id } from "@workspace/backend/convex/_generated/dataModel"

interface CreateOrganizationModalProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

export default function CreateOrganizationModal({
  trigger,
  onSuccess
}: CreateOrganizationModalProps) {
  const createOrg = useMutation(api.organization.create)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<OrgFormData>({
    name: "",
    slug: "",
    image: "",
  })

  const handleFormChange = (data: OrgFormData) => {
    setFormData(data)
  }

  const handleCreateOrg = async () => {
    try {
      const result = await createOrg({
        name: formData.name,
        slug: formData.slug,
        image: formData.image,
      })
      
      if (!result.error) {
        // Reset form and close dialog
        setFormData({
          name: "",
          slug: "",
          image: "",
        })
        setOpen(false)
        onSuccess?.()
      }
    } catch (error) {
      console.error("Error creating organization:", error)
    }
  }

  const handleFormBack = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <OrganizationForm
            data={formData}
            onChange={handleFormChange}
            onSubmit={handleCreateOrg}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
