import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function TermsConditionsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="lead">Last updated: June 4, 2023</p>

          <h2>1. Introduction</h2>
          <p>
            These terms and conditions ("Terms") govern your use of the Lumos platform, website, and services
            (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If
            you disagree with any part of the Terms, you may not access the Service.
          </p>

          <h2>2. Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at
            all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
            your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities
            or actions under your password, whether your password is with our Service or a third-party service.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming
            aware of any breach of security or unauthorized use of your account.
          </p>

          <h2>3. Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text,
            graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or
            through the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you
            own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and
            (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity
            rights, copyrights, contract rights or any other rights of any person.
          </p>

          <h2>4. Prohibited Uses</h2>
          <p>
            You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use
            the Service:
          </p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>
              For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing
              them to inappropriate content, asking for personally identifiable information, or otherwise.
            </li>
            <li>
              To transmit, or procure the sending of, any advertising or promotional material, including any "junk
              mail," "chain letter," "spam," or any other similar solicitation.
            </li>
            <li>
              To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other
              person or entity.
            </li>
            <li>
              In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or
              harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.
            </li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are
            and will remain the exclusive property of Lumos and its licensors. The Service is protected by copyright,
            trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress
            may not be used in connection with any product or service without the prior written consent of Lumos.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason
            whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your
            account, you may simply discontinue using the Service.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Lumos, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable
            for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss
            of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or
            inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii)
            any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions
            or content, whether based on warranty, contract, tort (including negligence) or any other legal theory,
            whether or not we have been informed of the possibility of such damage.
          </p>

          <h2>8. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What
            constitutes a material change will be determined at our sole discretion.
          </p>

          <h2>9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            Email: terms@lumos.com
            <br />
            Phone: +1 (555) 123-4567
            <br />
            Address: 123 Main Street, Suite 100, San Francisco, CA 94105
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
