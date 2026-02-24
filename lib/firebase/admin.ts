import 'server-only';

import { App, applicationDefault, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function buildServiceAccount() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    return null;
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };
}

let adminApp: App;

export function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  const serviceAccount = buildServiceAccount();

  adminApp = getApps().length
    ? getApp()
    : initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      });

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
