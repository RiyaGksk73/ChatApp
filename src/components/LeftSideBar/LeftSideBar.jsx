import React, { useState, useContext } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const LeftSideBar = () => {

    const navigate = useNavigate();
    const { userData, chatData, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    // ✅ SAME CHAT ID
    const getChatId = (u1, u2) => {
        return u1 < u2 ? u1 + "_" + u2 : u2 + "_" + u1;
    };

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;

            if (input) {
                setShowSearch(true);

                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);

                if (!querySnap.empty && querySnap.docs[0].id !== userData?.id) {
                    let userExist = false;

                    chatData.map((item) => {
                        if (item && item.rId === querySnap.docs[0].id) {
                            userExist = true;
                        }
                    });

                    if (!userExist) {
                        setUser({ ...querySnap.docs[0].data(), id: querySnap.docs[0].id });
                    }

                } else {
                    setUser(null);
                }

            } else {
                setUser(null);
                setShowSearch(false);
            }

        } catch (error) {
            console.error(error);
        }
    }

    const addChat = async () => {
        try {
            const chatId = getChatId(userData.id, user.id);

            // ✅ SAME MESSAGE DOC FOR BOTH
            await setDoc(doc(db, "messages", chatId), {
                createdAt: serverTimestamp(),
                messages: []
            }, { merge: true });

            const newChat = {
                messageId: chatId,
                lastMessage: "",
                rId: user.id,
                name: user.name,
                avatar: user.avatar,
                updatedAt: Date.now(),
            };

            // ✅ UPDATE BOTH USERS
            await updateDoc(doc(db, "chats", userData.id), {
                chatsData: arrayUnion(newChat)
            });

            await updateDoc(doc(db, "chats", user.id), {
                chatsData: arrayUnion({
                    ...newChat,
                    rId: userData.id,
                    name: userData.name,
                    avatar: userData.avatar
                })
            });

            setChatUser(newChat);
            setMessagesId(chatId);
            setUser(null);
            setShowSearch(false);

        } catch (error) {
            toast.error(error.message);
        }
    }

    const setChat = async (item) => {
        try {

            if (!item.messageId) return; // ✅ SAFETY

            setMessagesId(item.messageId);
            setChatUser(item);

            const userChatsRef = doc(db, 'chats', userData.id);
            const snap = await getDoc(userChatsRef);
            const data = snap.data();

            const index = data.chatsData.findIndex(
                (c) => c.messageId === item.messageId
            );

            if (index !== -1) {
                data.chatsData[index].messageSeen = true;

                await updateDoc(userChatsRef, {
                    chatsData: data.chatsData
                });
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='ls'>

            <div className='ls-top'>
                <div className='ls-nav'>
                    <img src={assets.logo} className='logo' alt='' />
                </div>

                <div className='ls-search'>
                    <img src={assets.search_icon} alt='' />
                    <input onChange={inputHandler} type='text' placeholder='Search here..' />
                </div>
            </div>

            <div className='ls-list'>
                {showSearch && user
                    ? <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                    : chatData.filter(item => item !== null).map((item, index) => (
                        <div
                            key={index}
                            onClick={() => setChat(item)}
                            className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}
                        >
                            <img src={item.avatar} alt="" />
                            <div>
                                <p>{item.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                }
            </div>

        </div>
    )
}

export default LeftSideBar;