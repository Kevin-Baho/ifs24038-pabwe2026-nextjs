import React from "react";
import PostLayout from "@/features/posts/layouts/PostLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PostLayout>
      <main role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </PostLayout>
  );
}