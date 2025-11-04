'use client'
import { Suspense, useState, useEffect, use } from "react";
import { 
  getAuth, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { Plus, Loader2 } from 'lucide-react';

// You'll need to import these from your project
import { app, db } from "@/lib/firebase";
// import { useCounterStore } from './store'

// Mock SharedContent component - replace with your actual import
function SharedContent({ title, text, url }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {title && (
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      )}
      {text && (
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          {text}
        </p>
      )}
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
        >
          {url}
        </a>
      )}
    </div>
  );
}

function SharedContentWrapper({ searchParamsPromise }) {
  // Unwrap the Promise using React.use()
  const searchParams = use(searchParamsPromise);
  
  return (
    <SharedContent
      title={searchParams?.title}
      text={searchParams?.text}
      url={searchParams?.url}
    />
  );
}

export default function Home({ searchParams }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize Firebase Auth
  useEffect(() => {
    // In your actual implementation, uncomment these lines:
    // const auth = getAuth(app);
    
    // Mock auth for demonstration - remove this in production
    const mockAuth = {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        // Simulate checking auth state
        setTimeout(() => {
          callback(null); // No user logged in
        }, 1000);
        return () => {}; // Unsubscribe function
      }
    };

    setLoading(true);
    
    // Replace mockAuth with 'auth' in production
    const unsubscribe = mockAuth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Fetch user details from Firestore
          // Uncomment in production:
          // const userRef = doc(db, "users", user.uid);
          // const userSnap = await getDoc(userRef);
          
          // Mock user data - remove in production
          const mockUserData = {
            name: user.displayName,
            email: user.email,
            profile_pic: user.photoURL,
            uid: user.uid,
          };
          
          setUserInfo(mockUserData);
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
  }, []);

  const handleAddRecipe = () => {
    // Navigate to dashboard or recipe creation
    // In production: router.push("/Dashboard")
    console.log("Navigating to dashboard...");
    alert("Add Recipe clicked! Redirect to dashboard.");
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

        {/* Add Recipe Button - Only shown when user is authenticated */}
        {authInitialized && (
          <div className="w-full mb-8 flex justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking authentication...</span>
              </div>
            ) : userInfo ? (
              <button
                onClick={handleAddRecipe}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Recipe
              </button>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Sign in to add recipes
              </div>
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