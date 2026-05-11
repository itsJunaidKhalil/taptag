import { redirect } from "next/navigation";

export default function ProfileRedirect() {
  redirect("/dashboard/edit?tab=profile");
}
