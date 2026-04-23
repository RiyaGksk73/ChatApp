import { doc, getDoc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [chatData, setChatsData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  // Load user data
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      setUserData(userData);

      if (userData.avatar && userData.name) {
        navigate("/Chat");
      } else {
        navigate("/Profile");
      }

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

      setInterval(async () => {
        if (auth.currentUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);

      const unSub = onSnapshot(chatRef, async (res) => {

        const data = res.data();

        // check if doc exists
        if (!data || !data.chatsData) {
          setChatsData([]);
          return;
        }

        const chatItems = data.chatsData;
        const tempData = [];

        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const otherUserData = userSnap.data();

          tempData.push({ ...item, userData: otherUserData });
        }

        setChatsData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });

      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatsData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;