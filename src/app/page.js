"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Send, LogIn } from "lucide-react";

const socket = io("http://localhost:5000");

export default function Home() {
  const [username, setUsername] = useState(""); // user credentials
  const [password, setPassword] = useState(""); // user credentials
  const [loggedIn, setLoggedIn] = useState(false); // login status
  const [message, setMessage] = useState(""); // current message input
  const [room, setRoom] = useState(""); // current room name
  const [joined, setJoined] = useState(false); // room join status
  const [privateUser, setPrivateUser] = useState(""); // recipient username
  const [mode, setMode] = useState("room"); // "room" or "private"
  const [roomChat, setRoomChat] = useState([]); // messages in the room
  const [privateChat, setPrivateChat] = useState([]); // messages in private chat
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomChat, privateChat]);

  useEffect(() => {
    socket.on("receiveGroupMessage", (msg) => {
      setRoomChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveGroupMessage");
    };
  }, []);

  useEffect(() => {
    socket.on("loadRoomMessages", (msgs) => {
      setRoomChat(msgs);
    });

    return () => {
      socket.off("loadRoomMessages");
    };
  }, []);

  useEffect(() => {
    socket.on("receivePrivateMessage", (msg) => {
      setPrivateChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receivePrivateMessage");
    };
  }, []);

  useEffect(() => {
    socket.on("loadPrivateMessages", (msgs) => {
      setPrivateChat(msgs);
    });

    return () => {
      socket.off("loadPrivateMessages");
    };
  }, []);

  const handleLogin = () => {
    socket.emit("login", { username, password }, (res) => {
      if (res.success) {
        setLoggedIn(true);
        toast.success(`Login success , message: ${res.message}`);
      } else {
        toast.error(`Login failed , message: ${res.message}`);
      }
    });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", { room });
    setMode("room");
    setJoined(true);
    toast.success(`You Joined to room: ${room}.`);
  };

  const joinPrivateChat = () => {
    socket.emit("leaveRoom", { room });
    socket.emit("joinPrivateChat", { withUser: privateUser });
    setMode("private");
    setJoined(false);
    toast.success(`You Joined to Private Chat with: ${privateUser}.`);
  };

  const sendMessage = () => {
    if (!message) return;

    if (mode === "room" && room) {
      socket.emit("sendGroupMessage", { room, message });
    } else if (mode === "private" && privateUser) {
      socket.emit("sendPrivateMessage", { to: privateUser, message });
    }

    setMessage("");
  };

  {
    /* Login */
  }
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue chatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Login / Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">Chat Application</CardTitle>
                  <CardDescription>
                    Room: <Badge variant="secondary">{room}</Badge> • Status:{" "}
                    <Badge variant={joined ? "default" : "secondary"}>
                      {joined ? "Connected" : "Disconnected"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Mode Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="room"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Room Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="private"
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Private Chat</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="room" className="mt-4">
                <div className="flex space-x-2">
                  <Input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Enter room name"
                    className="flex-1"
                  />
                  <Button onClick={() => joinRoom()} variant="default">
                    <Users className="mr-2 h-4 w-4" />
                    Join Room
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="private" className="mt-4">
                <div className="flex space-x-2">
                  <Input
                    value={privateUser}
                    onChange={(e) => setPrivateUser(e.target.value)}
                    placeholder="Enter recipient username"
                    className="flex-1"
                  />
                  <Button onClick={() => joinPrivateChat()} variant="default">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Start Chat
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {mode === "room"
                ? `Room: ${room}`
                : `Private Chat with ${privateUser}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 w-full rounded-md border p-4">
              <div className="space-y-3">
                {(mode === "room" ? roomChat : privateChat).map((msg, i) => {
                  const isCurrentUser = msg.from === username;
                  const formatTimestamp = (timestamp) => {
                    if (!timestamp) return "";
                    const date = new Date(timestamp);
                    return date.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  };

                  return (
                    <div
                      key={i}
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex flex-col space-y-1 max-w-xs ${
                          isCurrentUser ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="text-xs text-muted-foreground">
                          {msg.from} / {formatTimestamp(msg.timestamp)}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            isCurrentUser
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Scroll en alta otomatik gitmesi için dummy ref */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} size="lg">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
