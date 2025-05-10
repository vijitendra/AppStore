import StaticPage from "@/components/static-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, Info } from "lucide-react";

export default function PrivacyPage() {
  return (
    <StaticPage 
      title="Privacy & Security" 
      description="Learn about AppMarket's privacy policy, data practices, and security measures."
    >
      <Tabs defaultValue="privacy" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
          <TabsTrigger value="security">Security Measures</TabsTrigger>
          <TabsTrigger value="data">Data Rights</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="privacy">
          <div className="prose prose-lg max-w-none">
            <p className="lead">
              AppMarket is committed to protecting your privacy. This Privacy Policy explains how we
              collect, use, and safeguard your information when you use our platform.
            </p>
            
            <Alert className="my-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Last Updated</AlertTitle>
              <AlertDescription>This policy was last updated on May 1, 2023.</AlertDescription>
            </Alert>
            
            <h2>Information We Collect</h2>
            <p>
              We collect information to provide better services to our users and developers. The types of
              information we collect include:
            </p>
            
            <h3>Personal Information</h3>
            <ul>
              <li>
                <strong>Account Information:</strong> When you create an account, we collect your name, email address,
                and login credentials.
              </li>
              <li>
                <strong>Profile Information:</strong> Information you provide in your user or developer profile.
              </li>
              <li>
                <strong>Payment Information:</strong> If you make purchases through our platform, we collect payment
                details necessary to process transactions.
              </li>
            </ul>
            
            <h3>Usage Information</h3>
            <ul>
              <li>
                <strong>App Usage:</strong> Information about how you interact with apps downloaded from AppMarket.
              </li>
              <li>
                <strong>Device Information:</strong> Device identifiers, operating system, and browser type.
              </li>
              <li>
                <strong>Log Data:</strong> IP address, access times, pages viewed, and other statistics.
              </li>
            </ul>
            
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>To provide, maintain, and improve our services</li>
              <li>To authenticate your identity and prevent fraud</li>
              <li>To process transactions and send related information</li>
              <li>To provide customer support and respond to your requests</li>
              <li>To send you technical notices, updates, and security alerts</li>
              <li>To monitor usage patterns and track user activity</li>
              <li>To personalize your experience and recommend content</li>
            </ul>
            
            <h2>Information Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information to third parties. We may share your
              information in the following circumstances:
            </p>
            <ul>
              <li>With app developers for download and usage analytics</li>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations or enforce our terms</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
              <li>With your consent or at your direction</li>
            </ul>
            
            <h2>Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this Privacy Policy, unless a longer retention period is required or
              permitted by law.
            </p>
            
            <h2>Your Choices</h2>
            <p>You have several choices regarding your personal information:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> You can update your account information through your profile settings.
              </li>
              <li>
                <strong>Communications:</strong> You can opt out of receiving promotional emails by following the
                instructions in those emails.
              </li>
              <li>
                <strong>Cookies:</strong> You can set your browser to refuse cookies or indicate when a cookie is being sent.
              </li>
              <li>
                <strong>Data Access and Deletion:</strong> You can request access to, correction of, or deletion of your
                personal information.
              </li>
            </ul>
            
            <h2>Children's Privacy</h2>
            <p>
              Our services are not intended for children under 13, and we do not knowingly collect
              personal information from children under 13. If we learn that we have collected personal
              information from a child under 13, we will take steps to delete that information.
            </p>
            
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at
              privacy@appmarket.example.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="prose prose-lg max-w-none">
            <p className="lead">
              At AppMarket, security is our top priority. We implement robust measures to protect your
              data and ensure a safe app ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="text-xl font-bold flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  App Verification
                </h3>
                <p>
                  Every app undergoes security scanning and verification before being published on our platform.
                </p>
              </div>
              
              <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="text-xl font-bold flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Data Encryption
                </h3>
                <p>
                  All data transferred between your device and our servers is encrypted using industry-standard protocols.
                </p>
              </div>
              
              <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="text-xl font-bold flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Secure Authentication
                </h3>
                <p>
                  We offer multi-factor authentication options to protect your account from unauthorized access.
                </p>
              </div>
            </div>
            
            <h2>Our Security Practices</h2>
            
            <h3>Infrastructure Security</h3>
            <p>
              Our infrastructure is hosted in secure, SOC 2 compliant data centers with 24/7 monitoring,
              firewalls, and intrusion detection systems. We regularly update our systems and apply security
              patches to protect against vulnerabilities.
            </p>
            
            <h3>Application Security</h3>
            <p>
              We follow secure coding practices and conduct regular security assessments to identify and
              address potential weaknesses. Our development process includes automated security testing
              and code reviews.
            </p>
            
            <h3>App Verification Process</h3>
            <p>
              Before an app is available for download, we perform:
            </p>
            <ul>
              <li>Static and dynamic code analysis to detect malware</li>
              <li>Permission verification to ensure apps only request necessary permissions</li>
              <li>Developer identity verification</li>
              <li>Manual reviews for high-risk applications</li>
            </ul>
            
            <h3>Payment Security</h3>
            <p>
              All payment processing is handled by PCI-DSS compliant payment processors. We do not store
              complete credit card information on our servers.
            </p>
            
            <h3>Security Response</h3>
            <p>
              We maintain a security incident response team ready to address any security concerns.
              We investigate all reported security issues and work to resolve them promptly.
            </p>
            
            <Alert variant="destructive" className="my-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Report Security Issues</AlertTitle>
              <AlertDescription>
                If you discover a security vulnerability, please report it to security@appmarket.example.
                We appreciate your help in keeping our platform secure.
              </AlertDescription>
            </Alert>
            
            <h2>Best Practices for Users</h2>
            <ul>
              <li>Keep your account password strong and unique</li>
              <li>Enable two-factor authentication if available</li>
              <li>Review app permissions before installation</li>
              <li>Keep your device's operating system and apps updated</li>
              <li>Be cautious of phishing attempts and suspicious communications</li>
            </ul>
            
            <h2>Security Certifications</h2>
            <p>
              AppMarket is committed to maintaining industry-standard security certifications and
              compliances, including:
            </p>
            <ul>
              <li>ISO 27001 certification for information security management</li>
              <li>GDPR compliance for European users</li>
              <li>SOC 2 Type II certification for security, availability, and confidentiality</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <div className="prose prose-lg max-w-none">
            <p className="lead">
              At AppMarket, we respect your data rights and are committed to providing transparency
              and control over your personal information.
            </p>
            
            <h2>Your Data Rights</h2>
            <p>
              Depending on your location, you may have various rights regarding your personal data, including:
            </p>
            
            <div className="space-y-4 my-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold">Right to Access</h3>
                <p>
                  You have the right to request access to the personal data we collect about you.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold">Right to Rectification</h3>
                <p>
                  You can request that we correct inaccurate or incomplete information about you.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold">Right to Erasure</h3>
                <p>
                  In certain circumstances, you can request that we delete your personal data.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold">Right to Restriction of Processing</h3>
                <p>
                  You can request that we restrict the processing of your personal data in certain scenarios.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold">Right to Data Portability</h3>
                <p>
                  You can request to receive your personal data in a structured, commonly used format.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold">Right to Object</h3>
                <p>
                  You can object to our processing of your personal data in certain circumstances.
                </p>
              </div>
            </div>
            
            <h2>How to Exercise Your Rights</h2>
            <p>
              To exercise any of these rights, please contact us at privacy@appmarket.example with the subject
              "Data Rights Request" and specify which right you wish to exercise. We will respond to your
              request within 30 days.
            </p>
            
            <p>
              To verify your identity, we may request additional information from you. This is to ensure
              that we provide personal data only to the individual to whom it pertains.
            </p>
            
            <h2>Data Protection Officer</h2>
            <p>
              If you have concerns about how we handle your personal data, you can contact our Data Protection Officer at dpo@appmarket.example.
            </p>
            
            <h2>Regulatory Authorities</h2>
            <p>
              If you are located in the European Economic Area, you have the right to lodge a complaint with
              your local data protection authority if you believe we have not complied with applicable data
              protection laws.
            </p>
            
            <Alert className="my-6">
              <Info className="h-4 w-4" />
              <AlertTitle>California Residents</AlertTitle>
              <AlertDescription>
                If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA).
                Please see our <a href="/ccpa" className="text-primary hover:underline">CCPA Privacy Notice</a> for more information.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
        
        <TabsContent value="faq">
          <div className="prose prose-lg max-w-none">
            <p className="lead">
              Common questions about our privacy practices and security measures.
            </p>
            
            <Accordion type="single" collapsible className="w-full my-6">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does AppMarket protect my personal information?</AccordionTrigger>
                <AccordionContent>
                  We use a combination of technical, administrative, and physical security measures to protect your
                  personal information. These include encryption, secure hosting environments, access controls,
                  and regular security audits. We also limit access to personal information to authorized employees
                  who need it to perform their job functions.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What information does AppMarket collect about me?</AccordionTrigger>
                <AccordionContent>
                  We collect information you provide directly (such as account details and profile information),
                  information about your app usage (such as downloads and interactions), device information
                  (like operating system and device identifiers), and log data (such as IP address and access times).
                  For a complete list, please review our Privacy Policy.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Does AppMarket share my information with app developers?</AccordionTrigger>
                <AccordionContent>
                  Yes, we share certain information with app developers to facilitate app downloads and provide
                  usage analytics. This helps developers improve their apps and provide better service. However,
                  we limit the information shared to what is necessary, and we do not share personal information
                  beyond what is required for these purposes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How can I control what information AppMarket collects?</AccordionTrigger>
                <AccordionContent>
                  You can control your information through your account settings, where you can update your profile
                  information, adjust notification preferences, and manage your privacy settings. You can also use
                  your device settings to limit permissions granted to apps you download. Additionally, you can
                  contact us to request access to, correction of, or deletion of your personal information.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Does AppMarket use cookies?</AccordionTrigger>
                <AccordionContent>
                  Yes, we use cookies and similar technologies to enhance your experience, understand usage patterns,
                  and improve our services. You can manage cookie preferences through your browser settings. Please
                  note that blocking certain cookies may affect your ability to use some features of our platform.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>How safe are the apps on AppMarket?</AccordionTrigger>
                <AccordionContent>
                  We implement a comprehensive app verification process to ensure the apps on our platform are safe.
                  This includes automated scanning for malware, review of app permissions, and verification of
                  developer identities. However, we recommend always reviewing app permissions and user reviews
                  before downloading any app.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-7">
                <AccordionTrigger>What should I do if I notice suspicious activity on my account?</AccordionTrigger>
                <AccordionContent>
                  If you notice any suspicious activity, please change your password immediately and contact our
                  support team at security@appmarket.example. We recommend enabling two-factor authentication for
                  additional account security.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-8">
                <AccordionTrigger>How does AppMarket respond to data breaches?</AccordionTrigger>
                <AccordionContent>
                  We have a dedicated security incident response team and process. In the event of a data breach,
                  we will promptly investigate the incident, take measures to contain and remediate the breach,
                  and notify affected users and relevant authorities as required by applicable laws.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <h2>Still Have Questions?</h2>
            <p>
              If you have additional questions about our privacy or security practices, please contact us at privacy@appmarket.example
              or visit our <a href="/contact" className="text-primary hover:underline">Contact Page</a>.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </StaticPage>
  );
}