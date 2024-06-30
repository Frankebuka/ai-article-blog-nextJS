import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import app from "../firebase";

const RATE_LIMIT_MAX_REQUESTS_PER_DAY = 5;

export const checkRateLimit = async (userId: string): Promise<boolean> => {
  const db = getFirestore(app);
  const userRef = doc(db, "rateLimits", userId);
  const userSnap = await getDoc(userRef);
  const now = Timestamp.now().toDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight today

  if (!userSnap.exists()) {
    await setDoc(userRef, { requestCount: 1, lastRequestDate: today });
    return true;
  }

  const userData = userSnap.data();
  const requestCount = userData?.requestCount || 0;
  const lastRequestDate = userData?.lastRequestDate?.toDate() || new Date(0);

  if (lastRequestDate < today) {
    // Reset request count if it's a new day
    await setDoc(userRef, { requestCount: 1, lastRequestDate: today });
    return true;
  }

  if (requestCount >= RATE_LIMIT_MAX_REQUESTS_PER_DAY) {
    return false;
  }

  await updateDoc(userRef, {
    requestCount: requestCount + 1,
  });

  return true;
};
