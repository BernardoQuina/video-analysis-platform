import { PageLayout } from '../components/page-layout';

export default function Terms() {
  return (
    <PageLayout
      pageTitle="Video Analysis Demo | Terms of Service"
      pageDescription="This is a demo project showcasing how you can deploy complex applications on AWS infrastructure, making use of multiple services like S3, CloudFront, ECS, SQS, DynamoDB and more while still being cost efficient and having a simple but well-rounded CI/CD."
      backgroundEffects
    >
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Terms of Service</h2>
        <p className="mb-4">Last Updated: December 2024</p>

        <div className="space-y-4">
          <h3 className="text-xl font-medium">
            1. Demonstration Platform Usage
          </h3>
          <p className="mb-4">
            This platform is a technical demonstration with significant
            operational costs. By using this service, you explicitly acknowledge
            and agree to the following:
          </p>
          <ul className="list-inside list-disc pl-4">
            <li>
              This is a demonstration platform with real computational resources
              and costs
            </li>
            <li>
              The platform is intended for legitimate, good-faith testing and
              evaluation
            </li>
            <li>
              Intentional or negligent misuse may result in financial liability
            </li>
          </ul>

          <h3 className="text-xl font-medium">
            2. Platform Abuse and Cost Recovery
          </h3>
          <p>
            You are directly responsible for any extraordinary costs incurred
            due to platform abuse, including but not limited to:
          </p>
          <ul className="list-inside list-disc pl-4">
            <li>
              Excessive video uploads designed to strain computational resources
            </li>
            <li>
              Repeated processing of extremely large or numerous video files
            </li>
            <li>Intentional attempts to circumvent usage limitations</li>
            <li>
              Any actions that generate abnormal or unreasonable computational
              loads
            </li>
          </ul>

          <h3 className="text-xl font-medium">3. Cost Liability</h3>
          <p>
            In the event of demonstrated platform abuse, I reserve the right to:
          </p>
          <ul className="list-inside list-disc pl-4">
            <li>Immediately terminate your account</li>
            <li>
              Seek full financial reimbursement for incurred computational and
              infrastructure costs
            </li>
            <li>Pursue appropriate legal remedies for recovery of expenses</li>
          </ul>

          <h3 className="text-xl font-medium">4. User Responsibilities</h3>
          <ul className="list-inside list-disc pl-4">
            <li>You are responsible for the content you upload</li>
            <li>You must have the rights to upload and process any videos</li>
            <li>
              You agree not to upload content that is illegal, offensive, or
              violates others&apos; rights
            </li>
            <li>
              You understand this is a demonstration platform with limited
              resources
            </li>
          </ul>

          <h3 className="text-xl font-medium">5. Service Limitations</h3>
          <ul className="list-inside list-disc pl-4">
            <li>
              The platform is a technical demonstration with constrained
              resources
            </li>
            <li>Service availability and features may change without notice</li>
            <li>
              I reserve the right to modify, limit, or discontinue the service
              at any time
            </li>
            <li>
              There are no guarantees of continuous service or performance
            </li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
