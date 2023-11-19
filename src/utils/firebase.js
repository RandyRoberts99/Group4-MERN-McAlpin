// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyBe2aESEf5JdMlVC-cn4jgZXJDG51gGph8",

  authDomain: "cop4331-largeproject.firebaseapp.com",

  databaseURL: "https://cop4331-largeproject-default-rtdb.firebaseio.com",

  projectId: "cop4331-largeproject",

  storageBucket: "cop4331-largeproject.appspot.com",

  messagingSenderId: "627715613557",

  appId: "1:627715613557:web:31ca88069f753a7000693c",

  measurementId: "G-PDP5NWSRVX"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const db = getDatabase(app);