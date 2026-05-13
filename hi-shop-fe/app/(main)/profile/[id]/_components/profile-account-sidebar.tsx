"use client"

import { useState, useTransition } from "react"
import { Crown, LogOut, MapPin, Settings, ShieldCheck, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { handleLogout } from "@/app/_actions/authActions"
import { updateProfile } from "@/app/_actions/userActions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProfileAccountSidebarProps {
  user: User
}

const ProfileAccountSidebar = ({ user: initialUser }: ProfileAccountSidebarProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [user, setUser] = useState(initialUser)
  const [showEdit, setShowEdit] = useState(false)
  const [firstName, setFirstName] = useState(initialUser.firstName)
  const [lastName, setLastName] = useState(initialUser.lastName)

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  const handleSaveProfile = () => {
    startTransition(async () => {
      const result = await updateProfile({ firstName, lastName })
      if (result.success) {
        setUser((prev) => ({ ...prev, firstName, lastName }))
        setShowEdit(false)
        toast.success("Profile updated.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update profile.")
      }
    })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-on-surface mb-4">Account</h2>

      <div className="space-y-3">
        <div className="bg-card rounded-xl p-4 ghost-border">
          <span className="label-text text-[10px] mb-3 block">Default Shipping</span>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-on-surface-variant">No address saved.</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 ghost-border">
          <span className="label-text text-[10px] mb-3 block">Membership</span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Crown className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Member</p>
                <p className="text-[11px] text-on-surface-variant">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 ghost-border">
          <span className="label-text text-[10px] mb-3 block">Security</span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-tertiary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Password Login</p>
                <p className="text-xs text-tertiary font-semibold">Active</p>
              </div>
            </div>
          </div>
        </div>

        {showEdit ? (
          <div className="bg-card rounded-xl p-4 ghost-border space-y-3">
            <span className="label-text text-[10px] block">Edit Profile</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="label-text text-[10px] mb-1 block">First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-sm bg-surface-container-low rounded-xl ghost-border"
                />
              </div>
              <div>
                <Label className="label-text text-[10px] mb-1 block">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 text-sm bg-surface-container-low rounded-xl ghost-border"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveProfile} disabled={isPending} className="gap-1">
                <Check className="h-3.5 w-3.5" />
                {isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFirstName(user.firstName)
                  setLastName(user.lastName)
                  setShowEdit(false)
                }}
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="default"
            className="w-full gap-2"
            onClick={() => setShowEdit(true)}
          >
            <Settings className="h-4 w-4" />
            Edit Profile
          </Button>
        )}

        <div className="flex items-center gap-3 bg-surface-container-low rounded-xl p-3 ghost-border">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
            {initials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-on-surface text-sm truncate">{fullName}</p>
            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileAccountSidebar
