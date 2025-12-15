"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Clock, Check, Eye } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface ContactMessage {
  id: string;
  email: string;
  message: string;
  orderNumber?: string;
  createdAt: string;
  status: "new" | "read" | "replied";
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: ContactMessage[] }>(
        "/contact"
      );
      setMessages(response.data.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id: string, status: "new" | "read" | "replied") => {
    try {
      await apiClient.patch(`/contact/${id}/status`, { status });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === "new") {
      updateStatus(message.id, "read");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-orange-100 text-orange-700">Nieuw</Badge>;
      case "read":
        return <Badge className="bg-blue-100 text-blue-700">Gelezen</Badge>;
      case "replied":
        return <Badge className="bg-green-100 text-green-700">Beantwoord</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Berichten</h1>
          <p className="text-gray-600">
            {messages.filter((m) => m.status === "new").length} nieuwe berichten
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Geen berichten</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMessage?.id === message.id ? "ring-2 ring-blue-500" : ""
                } ${message.status === "new" ? "bg-orange-50" : ""}`}
                onClick={() => handleViewMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm truncate max-w-[150px]">
                        {message.email}
                      </span>
                    </div>
                    {getStatusBadge(message.status)}
                  </div>
                  {message.orderNumber && (
                    <p className="text-xs text-orange-600 mb-1">
                      Order: {message.orderNumber}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {message.message}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: nl,
                    })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bericht Details</CardTitle>
                  {getStatusBadge(selectedMessage.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Van</label>
                  <p className="text-lg">{selectedMessage.email}</p>
                </div>

                {selectedMessage.orderNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Ordernummer
                    </label>
                    <p className="text-lg font-mono">{selectedMessage.orderNumber}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Bericht</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Ontvangen</label>
                  <p>
                    {formatDistanceToNow(new Date(selectedMessage.createdAt), {
                      addSuffix: true,
                      locale: nl,
                    })}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => updateStatus(selectedMessage.id, "read")}
                    disabled={selectedMessage.status !== "new"}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Markeer als Gelezen
                  </Button>
                  <Button
                    onClick={() => updateStatus(selectedMessage.id, "replied")}
                    disabled={selectedMessage.status === "replied"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Markeer als Beantwoord
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    💡 Tip: Beantwoord dit bericht door direct een email te sturen naar{" "}
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Selecteer een bericht om de details te bekijken</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}



