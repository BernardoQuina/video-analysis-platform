import { PageLayout } from '../components/page-layout';

export default function Privacy() {
  return (
    <PageLayout
      pageTitle="Video Analysis Demo | Privacy Policy"
      pageDescription="This is a demo project showcasing how you can deploy complex applications on AWS infrastructure, making use of multiple services like S3, CloudFront, ECS, SQS, DynamoDB and more while still being cost efficient and having a simple but well-rounded CI/CD."
      backgroundEffects
    >
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Privacy Policy</h2>
        <p className="mb-4">Last Updated: December 2024</p>

        <div className="space-y-4">
          <h3 className="text-xl font-medium">1. Information I Collect</h3>
          <p>
            When you use my video processing platform, I collect the following
            types of information:
          </p>
          <ul className="list-inside list-disc pl-4">
            <li>
              Google Sign-In Information: Your basic profile information from
              Google authentication
            </li>
            <li>
              User-Uploaded Videos: Any videos you choose to upload to the
              platform
            </li>
            <li>
              Associated Metadata: Thumbnails, transcriptions, object labels,
              and video summaries generated by AI services
            </li>
          </ul>

          <h3 className="text-xl font-medium">2. How I Use Your Information</h3>
          <p>I use the collected information to:</p>
          <ul className="list-inside list-disc pl-4">
            <li>Authenticate and manage your account</li>
            <li>Process and analyze uploaded videos using AI services</li>
            <li>Provide video storage and retrieval functionality</li>
            <li>
              Enable public/private video sharing based on your preferences
            </li>
          </ul>

          <h3 className="text-xl font-medium">3. Data Privacy and Security</h3>
          <p>I am committed to protecting your data:</p>
          <ul className="list-inside list-disc pl-4">
            <li>Videos and thumbnails remain in a secure Amazon S3 bucket</li>
            <li>AI analysis results are stored privately in Amazon DynamoDB</li>
            <li>Only you can access your private videos and analysis</li>
            <li>
              Videos are only made public if you explicitly choose to do so
            </li>
          </ul>

          <h3 className="text-xl font-medium">4. Data Deletion</h3>
          <p>You have full control over your data:</p>
          <ul className="list-inside list-disc pl-4">
            <li>
              You can permanently delete videos and associated AI analysis at
              any time
            </li>
            <li>Deletion is immediate and irreversible</li>
            <li>
              All associated data (video, thumbnail, transcription, labels) will
              be completely removed
            </li>
          </ul>

          <h3 className="text-xl font-medium">5. Third-Party Services</h3>
          <p>I use the following third-party services to process your data:</p>
          <ul className="list-inside list-disc pl-4">
            <li>Google Authentication for sign-in</li>
            <li>Amazon Web Services for infrastructure and AI processing</li>
            <li>
              No data is shared with these services beyond their intended
              processing purpose
            </li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
