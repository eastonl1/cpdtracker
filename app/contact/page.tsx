export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-gray-700 mb-4">
          Have a question, feature request, or issue? We’d love to hear from you.
        </p>
        <p className="text-gray-700">
          Email us at{" "}
          <a
            href="mailto:cpdtrackerapp@gmail.com"
            className="text-blue-600 underline"
          >
            cpdtrackerapp@gmail.com
          </a>{" "}
          and we’ll get back to you within 1–2 business days.
        </p>
      </div>
    </div>
  );
}
