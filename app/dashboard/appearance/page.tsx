import { redirect } from "next/navigation";

export default function AppearanceRedirect() {
  redirect("/dashboard/edit?tab=appearance");
}
