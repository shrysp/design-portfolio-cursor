import { projectMetadata } from "@/lib/projectMeta";

// The page itself runs in the browser, so its title and share preview live here
export const metadata = projectMetadata("dashworks");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
