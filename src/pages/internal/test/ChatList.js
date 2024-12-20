import React, { useEffect, useState } from "react";
import CreateIcon from "../../../assets/icons/newMessage.svg";
import dateTimeFormatter from "../../../hooks/dateTimeFormatter";
import Loader from "../../../components/loader/Loader";
import { useAuthContext } from "../../../hooks/context/useAuthContext";
import { toast } from "sonner";

const ChatList = ({
  size,
  rooms,
  loading,
  setSelectedRoom,
  selectedRoom,
  showAddCollabModal,
  fetchRooms,
  socket,
  io,
}) => {
  const { user } = useAuthContext();
  const joinRoom = (data) => {
    setSelectedRoom(data);
  };
  useEffect(() => {
    socket.on("receive_message", () => {
      fetchRooms(); // Update messages after receiving
      io.emit("refresh_chatlist");
    });
    return () => {
      socket.off("receive_message"); // Clean up the listener when the component unmounts
    };
  }, []);
  useEffect(() => {
    const refreshChatlist = "Chat list refreshed";
    // Listen for the refresh_chatlist event
    socket.on("refresh_chatlist", () => {
      fetchRooms(); // Update messages after receiving
    });

    // Cleanup the listener on component unmount
    return () => {
      socket.off("refresh_chatlist");
    };
  }, []);

  return (
    <>
      <div className={`chatList  ${size} ${selectedRoom}`}>
        <div className="header">
          <span className="title">Chats</span>
          <span className="action">
            {(user?.position === 1 || user?.position === 2) && (
              <button className="btn-send" onClick={showAddCollabModal}>
                <img src={CreateIcon} className="icon" />
              </button>
            )}
          </span>
        </div>
        <div className="body">
          {rooms?.map((room, index) => {
            const { date, formattedTime } = dateTimeFormatter(
              room?.latestChat?.timestamp || room?.createdAt
            );
            return (
              <div
                key={index}
                className={`room ${
                  selectedRoom?.title == room?.title && "room-selected"
                }`}
                onClick={() => joinRoom(room)}>
                <span className="room-title">{room?.title}</span>
                <span className="room-latest-message ">
                  {user?._id === room?.lastChat?.sender?._id
                    ? `You: ${room?.lastChat?.message[0]?.content}`
                    : `${room?.lastChat?.sender?.fullName}: ${room?.lastChat?.message[0]?.content}`}
                </span>
                <span className="room-latest-time">
                  {`${date} - ${formattedTime}`}
                </span>
              </div>
            );
          })}
        </div>
        <div className="footer"></div>
      </div>
    </>
  );
};

export default ChatList;
