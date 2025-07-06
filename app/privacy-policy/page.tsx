export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-700 mb-4">
          CPDTracker respects your privacy. We collect and store your email, CPD logs, and file attachments solely to help you track your professional development.
        </p>
        <p className="text-gray-700 mb-4">
          Your data is never shared or sold. Only you can access your data unless legally required otherwise. You may request deletion of your account and data at any time by contacting us.
        </p>
        <p className="text-gray-700">
          Questions? Contact us at{" "}
          <a
            href="mailto:cpdtrackerapp@gmail.com"
            className="text-blue-600 underline"
          >
            cpdtrackerapp@gmail.com
          </a>.
        </p>
      </div>
    </div>
  );
}
