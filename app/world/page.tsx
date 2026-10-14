import { redirect } from "next/navigation";

// the world has no lobby of its own — you choose a side at the face
export default function WorldIndex() {
  redirect("/face");
}
