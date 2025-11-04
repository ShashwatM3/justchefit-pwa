'use client'
import { Suspense, useState, useEffect, use } from "react";
import { 
  getAuth, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Plus, Loader2, LogIn } from 'lucide-react';
import { app, db } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import SharedContent from "./components/SharedContent";

interface SearchParams {
  title?: string;
  text?: string;
  url?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function SharedContentWrapper({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
  const searchParams = use(searchParamsPromise);
  
  return (
    <SharedContent
      title={searchParams?.title}
      text={searchParams?.text}
      url={searchParams?.url}
    />
  );
}

function AddRecipeButton({ searchParamsPromise }: { searchParamsPromise: Promise<SearchParams> }) {
  const searchParams = use(searchParamsPromise);
  const router = useRouter();
  const handleAddRecipe = (searchParams: SearchParams) => {
    router.push(`/Dashboard?title=${searchParams?.title}&text=${searchParams?.text}&url=${searchParams?.url}`);
  };
  return (
    searchParams && Object.keys(searchParams).length > 0 ? (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAddRecipe(searchParams)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Recipe
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-gray-500">
        <span>No shared content</span>
      </div>
    )
  )
}

export default function Home({ searchParams }: PageProps) {
  const auth = getAuth(app);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState({})
  const [signingIn, setSigningIn] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch extra profile details from Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserInfo(userSnap.data());
          } else {
            // If user doc doesn't exist yet, create it
            const newUser = {
              name: user.displayName,
              email: user.email,
              profile_pic: user.photoURL,
              uid: user.uid,
            };
            await setDoc(userRef, newUser, { merge: true });
            setUserInfo(newUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserInfo(null);
        }
      } else {
        setUserInfo(null);
      }
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [auth, setUserInfo]);

  // Sign in with Google handler
  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // User details will sync via onAuthStateChanged
      console.log("Sign-in successful:", user);
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Failed to sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleAddRecipe = () => {
    router.push("/Dashboard");
  };

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
          <SharedContentWrapper searchParamsPromise={searchParams} />
        </Suspense>

        {/* Authentication Section */}
        {authInitialized && (
          <div className="w-full mb-8 flex justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking authentication...</span>
              </div>
            ) : userInfo ? (
              <AddRecipeButton searchParamsPromise={searchParams} />
            ) : (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in with Google
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            JustChefIt PWA
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A Progressive Web App that can receive shared content from other
            apps. Install this app to use it as a share target for URLs and
            content from social media apps like Instagram.
          </p>
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