import React, { useState, useEffect } from "react";
import ApiService from "./service";
import "materialize-css/dist/css/materialize.min.css";
import ReactMarkdown from "react-markdown";
import "./App.css";
import FeeImage from './Fee.png';

const App = () => {
  const [conversation, setConversation] = useState({
    messages: [],
    _id: null,
  });
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    ApiService.getAllConversations()
      .then((res) => {
        setConversations(res);
      })
      .catch((error) => {
        window.alert(error.message ?? error.toString());
      });
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      let conversationId = conversation._id;

      if (!conversation._id) {
        await ApiService.startConversation()
          .then((res) => {
            setConversation(res);
            conversationId = res._id;
            setConversations([res, ...conversations]);
          })
          .catch((error) => window.alert(error.message ?? error.toString()));
      }
      setConversation((conversation) => ({
        ...conversation,
        messages: [
          ...conversation.messages,
          { role: "user", content: message.trim() },
        ],
      }));
      setIsLoading(true);
      await ApiService.sendMessage(conversationId, message)
        .catch((error) => {
          error.message ?? error.toString();
        })
        .then((res) => {
          setConversation(res);
          setMessage("");
          // set conversion description
          setConversations((conversations) =>
            conversations.map((c) => {
              if (c._id === res._id) {
                c.description = res.description;
              }
              return c;
            })
          );
        });
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      let conversationId = conversation._id;
      if (!conversation._id) {
        await ApiService.startConversation()
          .then((res) => {
            setConversation(res);
            conversationId = res._id;
            setConversations([res, ...conversations]);
          })
          .catch((error) => console.log(error));
      }
      setIsLoading(true);
      await ApiService.uploadContext(conversationId, file)
        .then((res) => {
          setConversation(res);
          // set conversion description
          setConversations((conversations) =>
            conversations.map((c) => {
              if (c._id === res._id) {
                c.description = res.description;
              }
              return c;
            })
          );
        })
        .catch((error) => window.alert(error.message ?? error.toString()));
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const startConversation = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    await ApiService.startConversation()
      .then((res) => {
        setConversation(res);
        setConversations([res, ...conversations]);
      })
      .catch((error) => console.log(error));
    setIsLoading(false);
  };

  const getConversationById = (id) => {
    ApiService.getConversationById(id)
      .then((res) => {
        setConversation(res);
      })
      .catch((error) => {
        console.error(error.message ?? error.toString());
      });
  };

  return (
    <div className="app-container">
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <i className="material-icons">close</i>
        </button>
        <h5 className="mt-2 text-center">Conversations</h5>
        <ul>
          <li
            className="d-flex align-items-center"
            onClick={() => startConversation()}
          >
            <i className="material-icons">add</i> Start Conversation
          </li>
          {conversations.map((conversation) => (
            <li
              key={conversation._id}
              onClick={() => getConversationById(conversation._id)}
            >
              {conversation.description || `Conversation ${conversation._id}`}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-container">
      <div className="image-container">
      <img src={FeeImage} alt="Profile" />
      </div>
        <div className="row">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            &#9776;
          </button>
          <div className="flex-1 align-center" style={{ marginTop: "1rem" }}>
            {conversation._id ? (
              <>
                {" "}
                {conversation.description || `Conversation ${conversation._id}`}
              </>
            ) : (
              <>Start Conversation</>
            )}
          </div>
        </div>

        <div className="chat-window">
          {conversation && conversation.messages.length > 0 ? (
            conversation.messages
              .filter((messages) =>
                ["assistant", "user"].includes(messages.role)
              )
              .map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.role === "user" ? "user-message" : "ai-message"
                  }`}
                >
                  <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ))
          ) : (
            <p className="no-messages">No messages!</p>
          )}
        </div>
        <div className="input-bar">
          <textarea
            id="message"
            className="materialize-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
          ></textarea>
          <button
            className="btn  waves-effect waves-light"
            onClick={handleSendMessage}
            name="action"
            disabled={isLoading}
          >
            Submit
            <i className="material-icons right">send</i>
          </button>

          <div className="file-field">
            <button className="btn btn-floating" disabled={isLoading}>
              <i className="material-icons">attach_file</i>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="application/pdf"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
