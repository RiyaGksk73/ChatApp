import React, { useContext, useState, useEffect } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } =
    useContext(AppContext);

  const [input, setInput] = useState("");

  const sendMessages = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser?.rId, userData?.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId   // ✅ FIXED
            );

            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
              userChatData.chatsData[chatIndex].updatedAt = Date.now();

              if (
                userChatData.chatsData[chatIndex].rId === userData.id
              ) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }

    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      const fileUrl = URL.createObjectURL(file); // ✅ FIXED

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser?.rId, userData?.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId   // ✅ FIXED
            );

            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = "Image";
              userChatData.chatsData[chatIndex].updatedAt = Date.now();

              if (
                userChatData.chatsData[chatIndex].rId === userData.id
              ) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatsRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    if (!timestamp) return "";

    let date = timestamp?.toDate?.() || new Date(timestamp);

    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0"); // ✅ FIXED

    if (hour > 12) {
      return hour - 12 + ":" + minute + " PM";
    } else {
      return hour + ":" + minute + " AM";
    }
  };

  // ✅ FINAL FIX (VERY IMPORTANT)
  useEffect(() => {
    if (!messagesId) return;

    const messageRef = doc(db, "messages", messagesId);

    const unSub = onSnapshot(messageRef, (res) => {
      if (!res.exists()) {
        setMessages([]);
        return;
      }

      setMessages(res.data().messages || []);
    });

    return () => unSub();
  }, [messagesId]);

  return chatUser ? (
    <div className="chat-box">

      {/* Header */}
      <div className="chat-user">
        <img src={chatUser?.userData?.avatar} alt="" />
        <p>
          {chatUser?.userData?.name}{" "}
          {Date.now() - (chatUser?.userData?.lastSeen || 0) <= 70000 ? (
            <span className="dot"></span>
          ) : null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
      </div>

      {/* Messages */}
      <div className="chat-msg">
        {messages &&
          messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sId === userData?.id ? "s-msg" : "r-msg"} // ✅ FIXED
            >
              {msg.image ? (
                <img className="msg-img" src={msg.image} alt="" />
              ) : (
                <p className="msg">{msg.text}</p>
              )}

              <div>
                <img
                  src={
                    msg.sId === userData?.id
                      ? userData?.avatar
                      : chatUser?.userData?.avatar || assets.profile_img
                  }
                  alt=""
                />
                <p>{convertTimestamp(msg.createdAt)}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>

        <img onClick={sendMessages} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;