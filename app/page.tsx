'use client'
import { Suspense, useState, useEffect } from "react";
import { 
  getAuth, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Plus, Loader2, LogIn } from 'lucide-react';
import { app, db } from "@/lib/firebase";
import { useRouter, useSearchParams } from 'next/navigation';
import SharedContent from "./components/SharedContent";

function HomeContent() {
  const auth = getAuth(app);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [autoSignInAttempted, setAutoSignInAttempted] = useState(false);

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
  
    function getRandomGradient() {
      // Helper to generate a random color avoiding black/white extremes
      function randomColor() {
        const r = Math.floor(Math.random() * 200) + 30; // 30-229
        const g = Math.floor(Math.random() * 200) + 30;
        const b = Math.floor(Math.random() * 200) + 30;
        return `rgb(${r},${g},${b})`;
      }
    
      // Random angle for gradient
      const angle = Math.floor(Math.random() * 360);
    
      // Pick 2-3 colors for the gradient
      const colors = [randomColor(), randomColor()];
      if (Math.random() > 0.5) colors.push(randomColor());
    
      // Construct gradient string
      return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    }
  
    function encodeDate(date: Date) {
      return Buffer.from(date.toISOString()).toString("base64");
    }
  
    async function saveCreateRecipe(recipe_object: any) {
      console.log("Loading us STARTING");
      if (userInfo) {
        const dt = new Date()
        const recipeID = encodeDate(dt);
        try {
          await setDoc(doc(db, "users", userInfo.uid, "recipes", recipeID), {
            name: recipe_object.recipe_name,
            date_created: dt,
            chef: {
              "name": "Standard",
              "voiceAssistant": "DHeSUVQvhhYeIxNUbtj3",
              "voiceChef": "tWGXkYJGea4wMBN4mLD1"
            },
            prep_type: "As suggested by recipe",
            complexity: "As suggested by the recipe extracted",
            step: "ONBOARD",
            gradient: getRandomGradient(),
            initial_recipe: recipe_object.initial_recipe,
            additional_info: "None"
          });
          alert("Your recipe has been added successfully!");
          window.open("https://justchefit.vercel.app/")
        } catch(err) {
          console.log("Loading ENDED");
          console.log("Error: ", err)
        }
      }
    }
  
    async function extractAnyGetRecipe(url_provided: any) {
      console.log("loading...")
      if (!(url_provided)) {
        alert("No URL Provided");
        return;
      }
      try {
        const res = await fetch("/api/fetch-transcript-insta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url_provided
          }),
        });
      
        const data = await res.json();
        
        if (!res.ok || data.error) {
          if (data.error) {
            console.log("Loading ENDED");
            console.log("We weren't able to process your recipe. Try again later!")
          }
          console.error(data.error || "Failed to fetch transcript");
          console.error("API Error:", data.error);
        } else {
          const recipe = data.recipe_object
          console.log("Loading ENDED");
          saveCreateRecipe(data.recipe_object);
        }
      } catch (err) {
        console.error("Failed to send request. Please try again.");
        console.error("Error sending POST request:", err);
      } finally {
        console.log("Loading ENDED");
      }
    }
    
    const handleAddRecipe = () => {
      const params = new URLSearchParams();
      if (title) params.set('title', title);
      if (text) params.set('text', text);
      if (url) params.set('url', url);
      extractAnyGetRecipe(text.startsWith("http") ? text : url.startsWith("http") ? url : null)
    };
  
    // const hasSharedContent = title || text || url;
    const hasSharedContent = "hello";
    
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

  // Check if there's shared content
  const hasSharedContent = Boolean(
    searchParams.get('title') || 
    searchParams.get('text') || 
    searchParams.get('url')
  );

  // Handle redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Redirect sign-in successful:", result.user);
          // User data will be set by onAuthStateChanged
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
      }
    };

    handleRedirectResult();
  }, [auth]);

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

          // Log shared content when user is authenticated
          if (hasSharedContent) {
            console.log("User authenticated with shared content:", {
              user: user.email,
              sharedContent: {
                title: searchParams.get('title'),
                text: searchParams.get('text'),
                url: searchParams.get('url')
              }
            });
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
  }, [auth, hasSharedContent, searchParams]);

  // Auto-trigger sign-in if user has shared content but is not authenticated
  useEffect(() => {
    if (
      authInitialized && 
      !loading && 
      !userInfo && 
      hasSharedContent && 
      !autoSignInAttempted &&
      !signingIn
    ) {
      console.log("Shared content detected without authentication. Triggering auto sign-in...");
      setAutoSignInAttempted(true);
      handleSignIn(true); // Pass true to indicate auto sign-in
    }
  }, [authInitialized, loading, userInfo, hasSharedContent, autoSignInAttempted, signingIn]);

  // Sign in with Google handler
  const handleSignIn = async (isAutoTriggered = false) => {
    setSigningIn(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      
      // Try popup first, fall back to redirect if it fails
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("Popup sign-in successful:", result.user);
      } catch (popupError: any) {
        console.log("Popup failed, trying redirect...", popupError);
        
        // If popup was blocked or failed, use redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          console.log("Using redirect method instead...");
          await signInWithRedirect(auth, provider);
          // Don't set signingIn to false here, as redirect will reload the page
          return;
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      
      // Only show alert if it wasn't an auto-triggered sign-in
      if (!isAutoTriggered) {
        alert("Failed to sign in. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        
        {/* Show loading state while checking auth */}
        {!authInitialized || loading ? (
          <div className="w-full flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600 dark:text-gray-400">
                {signingIn ? "Signing you in..." : "Loading..."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Only show shared content if user is authenticated */}
            {userInfo && hasSharedContent && (
              <Suspense
                fallback={
                  <div className="w-full max-w-3xl mx-auto mb-8 p-4 text-center text-gray-500">
                    Loading shared content...
                  </div>
                }
              >
                <SharedContentWrapper />
              </Suspense>
            )}

            {/* Authentication Section */}
            {authInitialized && (
              <div className="w-full mb-8 flex justify-center">
                {userInfo ? (
                  <div className="flex items-center justify-between w-full">
                    {hasSharedContent ? (
                      <AddRecipeButton />
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Welcome back! Share content to get started.
                        </p>
                      </div>
                    )}
                    <button onClick={() => {
                      signOut(auth).then(() => {
                        alert("Sign out successful");
                        window.location.reload();
                      }).catch((error) => {
                        alert("Sign out UNSUCCESSFUL!")
                      });
                    }}>Sign out</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {hasSharedContent && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 text-center">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          🔗 Shared content detected! Please sign in to continue.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => handleSignIn(false)}
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
                  </div>
                )}
              </div>
            )}

            {/* App Description */}
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
          </>
        )}
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