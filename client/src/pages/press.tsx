import StaticPage from "@/components/static-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PressPage() {
  // In a real implementation, these would be fetched from an API
  const pressReleases = [
    {
      id: 1,
      title: "AppMarket Secures $15M in Series A Funding to Expand Alternative App Store",
      date: "May 15, 2023",
      excerpt: "The funding will be used to enhance platform features, improve developer tools, and expand global reach."
    },
    {
      id: 2,
      title: "AppMarket Surpasses 10 Million Monthly Active Users",
      date: "March 22, 2023",
      excerpt: "Milestone reflects growing consumer interest in alternative app distribution channels and AppMarket's commitment to user experience."
    },
    {
      id: 3,
      title: "AppMarket Launches Developer Accelerator Program",
      date: "February 8, 2023",
      excerpt: "New initiative aims to support indie developers with resources, mentorship, and marketing assistance."
    }
  ];

  const mediaAssets = [
    { title: "AppMarket Logo (PNG)", size: "2.3 MB" },
    { title: "AppMarket Logo (SVG)", size: "156 KB" },
    { title: "Brand Guidelines", size: "4.7 MB" },
    { title: "Executive Headshots", size: "8.2 MB" },
    { title: "Product Screenshots", size: "12.4 MB" }
  ];

  return (
    <StaticPage 
      title="Press & Media" 
      description="Media resources, press releases, and contacts for AppMarket press inquiries."
    >
      <p className="lead mb-8">
        Find the latest press releases, media resources, and contact information for press inquiries about AppMarket.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Press Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">For press inquiries, please contact:</p>
            <p className="font-medium">Media Relations</p>
            <p>press@appmarket.example</p>
            <p className="mt-4">For urgent matters:</p>
            <p>+1 (555) 123-4567</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Facts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li><strong>Founded:</strong> 2023</li>
              <li><strong>Headquarters:</strong> San Francisco, CA</li>
              <li><strong>Employees:</strong> 50+</li>
              <li><strong>Users:</strong> 10M+ monthly active</li>
              <li><strong>Available Apps:</strong> 50,000+</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Media Kit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Download our comprehensive media kit with logos, screenshots, and fact sheets.</p>
            <Button>Download Media Kit</Button>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Press Releases</h2>
      
      <div className="space-y-6 mb-12">
        {pressReleases.map(release => (
          <Card key={release.id}>
            <CardHeader>
              <CardDescription>{release.date}</CardDescription>
              <CardTitle>{release.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{release.excerpt}</p>
              <Button variant="outline">Read Full Release</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Media Assets</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Downloadable Resources</CardTitle>
          <CardDescription>Brand assets for media usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {mediaAssets.map((asset, index) => (
              <div key={index} className="py-3 flex items-center justify-between">
                <span>{asset.title}</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-4">{asset.size}</span>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-2xl font-bold mt-12 mb-6">Coverage Highlights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">"AppMarket Disrupts Traditional App Distribution Model"</CardTitle>
            <CardDescription>TechCrunch - April 2023</CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="italic border-l-4 border-primary pl-4 py-2">
              "AppMarket's innovative approach to app distribution is challenging the status quo and providing
              developers with much-needed alternatives to mainstream app stores."
            </blockquote>
            <Button variant="link" className="p-0 mt-2">Read Article</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">"The Rise of Alternative App Marketplaces: AppMarket Takes the Lead"</CardTitle>
            <CardDescription>The Verge - March 2023</CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className="italic border-l-4 border-primary pl-4 py-2">
              "With its user-friendly interface and robust security measures, AppMarket is quickly becoming
              the go-to alternative for Android users seeking apps outside the Google Play ecosystem."
            </blockquote>
            <Button variant="link" className="p-0 mt-2">Read Article</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Stay Updated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Subscribe to our press mailing list to receive the latest news and updates directly in your inbox.
          </p>
          <Button>Subscribe to Press Updates</Button>
        </CardContent>
      </Card>
    </StaticPage>
  );
}