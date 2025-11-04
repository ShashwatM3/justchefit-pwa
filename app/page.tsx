'use client'
import { Suspense, useState, useEffect } from "react";
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
import { useRouter, useSearchParams } from 'next/navigation';
import SharedContent from "./components/SharedContent";

interface UserInfo {
  name: string | null;
  email: string | null;
  profile_pic: string | null;
  uid: string;
}

function AddRecipeButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const title = searchParams.get('title') || '';
  const text = searchParams.get('text') || '';
  const url = searchParams.get('url') || '';
  
  const handleAddRecipe = () => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (text) params.set('text', text);
    if (url) params.set('url', url);
    router.push(`/Dashboard?${params.toString()}`);
  };

  const hasSharedContent = title || text || url;
  
  return hasSharedContent ? (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAddRecipe}
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
  );
}

function SharedContentWrapper() {
  const searchParams = useSearchParams();
  
  return (
    <SharedContent
      title={searchParams.get('title') || undefined}
      text={searchParams.get('text') || undefined}
      url={searchParams.get('url') || undefined}
    />
  );
}

function HomeContent() {
  const auth = getAuth(app);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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
            setUserInfo(userSnap.data() as UserInfo);
          } else {
            // If user doc doesn't exist yet, create it
            const newUser: UserInfo = {
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
  }, [auth]);

  // Sign in with Google handler
  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Sign-in successful:", user);
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Failed to sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
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
          <SharedContentWrapper />
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
              <AddRecipeButton />
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}