import { Suspense } from "react";
import SharedContent from "./components/SharedContent";

interface PageProps {
  searchParams: Promise<{
    title?: string;
    text?: string;
    url?: string;
  }>;
}

async function SharedContentWrapper({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <SharedContent
      title={params.title}
      text={params.text}
      url={params.url}
    />
  );
}

export default function Home({ searchParams }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Suspense
          fallback={
            <div className="w-full max-w-3xl mx-auto mb-8 p-4 text-center text-gray-500">
              Loading shared content...
            </div>
          }
        >
          <SharedContentWrapper searchParams={searchParams} />
        </Suspense>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            JustChefIt PWA
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A Progressive Web App that can receive shared content from other
            apps. Install this app to use it as a share target for URLs and
            content from social media apps like Instagram.
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>How to use:</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 list-disc list-inside space-y-1">
              <li>Install this app on your device</li>
              <li>Share a URL or content from another app</li>
              <li>Select "JustChefIt" from the share menu</li>
              <li>The shared content will appear here</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full sm:w-auto">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}