import { redirect } from "next/navigation";

// Redirect gaming-laptops to laptops page
export default function GamingLaptopsPage() {
  redirect("/laptops");
}
