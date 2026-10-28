"use client";

import dynamic from "next/dynamic";
import Loading from "./loading";

const ResumeAppClient = dynamic(
  () => import("@/components/ResumeAppClient").then((mod) => mod.ResumeAppClient),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function Home() {
  return <ResumeAppClient />;
}

