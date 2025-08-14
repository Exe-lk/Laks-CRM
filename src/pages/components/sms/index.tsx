import { useState } from "react";

export default function SmsTestPage() {
  const [to, setTo] = useState("");
  const [body, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendSms = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/sms/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ SMS sent successfully: ${JSON.stringify(data)}`);
      } else {
        setStatus(`❌ Error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setStatus(`❌ Request failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Send SMS</h1>

        <input
          type="text"
          placeholder="Recipient Phone Number"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <textarea
          placeholder="Your message"
          value={body}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <button
          onClick={sendSms}
          disabled={loading}
          className={`w-full p-2 rounded text-white font-semibold ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
        >
          {loading ? "Sending..." : "Send SMS"}
        </button>

        {status && (
          <div
            className={`mt-4 p-2 rounded text-sm ${status.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
