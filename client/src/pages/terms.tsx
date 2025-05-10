import StaticPage from "@/components/static-page";

export default function TermsPage() {
  return (
    <StaticPage 
      title="Terms of Service" 
      description="AppMarket Terms of Service and user agreement"
    >
      <p className="lead">
        This Terms of Service agreement ("Agreement") is between you and AppMarket ("we," "us," or "our") 
        and governs your use of the AppMarket platform, including our website, mobile applications, 
        and services (collectively, the "Services").
      </p>
      
      <p className="mb-6">
        By accessing or using our Services, you agree to be bound by this Agreement. If you do not agree 
        to these terms, please do not use our Services.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">1. Account Registration</h2>
      <p>
        1.1. To access certain features of the Services, you may need to create an account. You agree to provide 
        accurate, current, and complete information during the registration process.
      </p>
      <p>
        1.2. You are responsible for maintaining the confidentiality of your account credentials and for all 
        activities that occur under your account.
      </p>
      <p>
        1.3. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">2. User Conduct</h2>
      <p>
        2.1. You agree not to use the Services to:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe the intellectual property rights of others</li>
        <li>Transmit any harmful code, such as viruses or malware</li>
        <li>Engage in unauthorized access to our systems or other users' accounts</li>
        <li>Harass, abuse, or harm another person</li>
        <li>Publish or distribute inappropriate, offensive, or illegal content</li>
      </ul>
      <p>
        2.2. We reserve the right to remove any content that violates these terms and to suspend or terminate 
        accounts that engage in prohibited conduct.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">3. Developer Terms</h2>
      <p>
        3.1. If you are a developer using our platform to distribute applications, you agree to comply with 
        our Developer Program Policies in addition to this Agreement.
      </p>
      <p>
        3.2. You are responsible for ensuring that your applications comply with all applicable laws and regulations 
        and do not infringe on the rights of third parties.
      </p>
      <p>
        3.3. We reserve the right to review, approve, or reject any application submitted to our platform at our 
        sole discretion.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">4. Intellectual Property</h2>
      <p>
        4.1. The Services, including all content, features, and functionality, are owned by AppMarket and are 
        protected by copyright, trademark, and other intellectual property laws.
      </p>
      <p>
        4.2. You may not copy, modify, distribute, sell, or lease any part of our Services without our explicit 
        permission.
      </p>
      <p>
        4.3. By submitting content to our Services, you grant us a worldwide, non-exclusive, royalty-free license 
        to use, reproduce, modify, adapt, publish, translate, and distribute that content.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">5. Third-Party Applications</h2>
      <p>
        5.1. Our Services may allow you to download applications developed by third parties. We are not responsible 
        for the content, policies, or practices of third-party applications.
      </p>
      <p>
        5.2. Your use of third-party applications is subject to the terms and conditions of the respective developers.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
      <p>
        6.1. TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPMARKET SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY 
        OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
      </p>
      <ul className="list-disc pl-8 mb-4">
        <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
        <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
        <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
        <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
      </ul>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">7. Modifications to the Agreement</h2>
      <p>
        7.1. We may modify this Agreement from time to time. If we make material changes, we will notify you 
        by email or by posting a notice on our website prior to the changes becoming effective.
      </p>
      <p>
        7.2. Your continued use of the Services after the effective date of any modifications constitutes your 
        acceptance of the modified Agreement.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">8. Termination</h2>
      <p>
        8.1. We may terminate or suspend your access to the Services immediately, without prior notice or liability, 
        for any reason, including if you breach this Agreement.
      </p>
      <p>
        8.2. Upon termination, your right to use the Services will immediately cease.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law</h2>
      <p>
        This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction], without 
        regard to its conflict of law provisions.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
      <p>
        If you have any questions about this Agreement, please contact us at legal@appmarket.example.
      </p>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Last updated: May 1, 2023
        </p>
      </div>
    </StaticPage>
  );
}