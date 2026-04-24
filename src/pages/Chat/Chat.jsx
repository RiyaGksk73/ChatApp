import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftSideBar from '../../components/LeftSideBar/LeftSideBar'
import ChatBox from '../../components/ChatBox/ChatBox'
import RightSidebar from '../../components/RightSideBar/RightSidebar'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData])

  return (
    <div className='Chat'>
      {
        loading
          ? <p className='Loading'>Loading...</p>
          : <div className='Chat-container'>
              <LeftSideBar />
              <ChatBox />
              <RightSidebar />
            </div>
      }
    </div>
  )
}

export default Chat