import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActivityType = 'login' | 'logout' | 'profile_update' | 'verify' | 'unverify';

export async function logUserActivity(
  userId: string,
  userName: string,
  type: ActivityType,
  details: string
) {
  if (!userId) return;
  try {
    const activityCollection = collection(db, 'activities');
    await addDoc(activityCollection, {
      userId,
      userName: userName || 'Anonymous User',
      type,
      details,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    console.log(`[Activity Logged] User: ${userName} (${userId}) - Type: ${type} - Details: ${details}`);
  } catch (error) {
    console.error("Failed to write to activities log:", error);
  }
}
