import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

// ✅ CHANGED: Using environment variables instead of hardcoded values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email: email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using chat app",
      lastSeen: Date.now()
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

    toast.success("Account created successfully");
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join("-"));
  }
};

const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Login successful");
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(""));
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return null;
  }
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent");
    } else {
      toast.error("Email doesn't exist");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

// Generate same chatId for both users
const getChatId = (user1, user2) => {
  return user1 < user2 ? user1 + "_" + user2 : user2 + "_" + user1;
};

const sendMessage = async (senderId, receiverId, message) => {
  try {
    const chatId = getChatId(senderId, receiverId);
    const time = Date.now();

    const messageData = {
      senderId,
      text: message,
      createdAt: time
    };

    await setDoc(doc(db, "messages", chatId), {
      messages: arrayUnion(messageData)
    }, { merge: true });

    const senderRef = doc(db, "chats", senderId);
    const receiverRef = doc(db, "chats", receiverId);

    const senderSnap = await getDoc(senderRef);
    if (!senderSnap.exists()) {
      await setDoc(senderRef, { chatsData: [] });
    }

    const receiverSnap = await getDoc(receiverRef);
    if (!receiverSnap.exists()) {
      await setDoc(receiverRef, { chatsData: [] });
    }

    await updateDoc(senderRef, {
      chatsData: arrayUnion({
        messageId: chatId,
        rId: receiverId,
        lastMessage: message,
        updatedAt: time
      })
    });

    await updateDoc(receiverRef, {
      chatsData: arrayUnion({
        messageId: chatId,
        rId: senderId,
        lastMessage: message,
        updatedAt: time
      })
    });

  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

export { signup, loginUser, logout, auth, db, resetPass, sendMessage };