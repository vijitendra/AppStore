import StaticPage from "@/components/static-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  // These would be pulled from an API in a real implementation
  const openPositions = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time"
    },
    {
      id: 2,
      title: "Backend Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time"
    },
    {
      id: 3,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time"
    },
    {
      id: 4,
      title: "Developer Relations",
      department: "Marketing",
      location: "Remote",
      type: "Full-time"
    },
    {
      id: 5,
      title: "Content Writer",
      department: "Marketing",
      location: "Remote",
      type: "Part-time"
    }
  ];

  return (
    <StaticPage 
      title="Join Our Team" 
      description="Browse current job openings and career opportunities at AppMarket."
    >
      <p className="lead">
        At AppMarket, we're building the future of app distribution. Join our diverse team of
        passionate individuals working together to create an innovative platform for developers and users.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-primary/10 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Growth & Learning</h3>
          <p>
            We invest in our team's growth with continuous learning opportunities, mentorship, and career development paths.
          </p>
        </div>
        
        <div className="bg-primary/10 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Work-Life Balance</h3>
          <p>
            We believe in sustainable pace and flexible work arrangements that respect your time and well-being.
          </p>
        </div>
        
        <div className="bg-primary/10 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Inclusive Culture</h3>
          <p>
            We're committed to fostering an inclusive environment where diverse perspectives are valued and celebrated.
          </p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mt-12 mb-6">Open Positions</h2>
      
      <div className="space-y-4">
        {openPositions.map(position => (
          <Card key={position.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{position.title}</CardTitle>
                  <CardDescription>
                    {position.department} • {position.location} • {position.type}
                  </CardDescription>
                </div>
                <Button>Apply Now</Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>
                We're looking for a talented {position.title.toLowerCase()} to join our team and help build 
                the next generation of app marketplace features.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <h3 className="font-bold text-xl mb-2">Don't see a matching position?</h3>
        <p className="mb-4">
          We're always on the lookout for exceptional talent. Send us your resume and let us know 
          how you could contribute to our mission.
        </p>
        <Button variant="outline">Submit General Application</Button>
      </div>
      
      <h2 className="text-2xl font-bold mt-12 mb-4">Our Hiring Process</h2>
      <ol className="list-decimal ml-6 space-y-2">
        <li>
          <strong>Application Review</strong> - Our team reviews your application and matches your skills with our needs.
        </li>
        <li>
          <strong>Initial Interview</strong> - A conversation to get to know you and discuss your experience and goals.
        </li>
        <li>
          <strong>Technical Assessment</strong> - A task or project relevant to the role you're applying for.
        </li>
        <li>
          <strong>Team Interviews</strong> - Meet potential team members and stakeholders.
        </li>
        <li>
          <strong>Offer</strong> - If there's a mutual fit, we'll extend an offer and welcome you to the team!
        </li>
      </ol>
      
      <div className="mt-12 text-center">
        <h3 className="font-bold text-2xl mb-4">Ready to Join Us?</h3>
        <p className="mb-6">
          Explore our open positions and take the first step toward a rewarding career at AppMarket.
        </p>
        <Button size="lg">View All Positions</Button>
      </div>
    </StaticPage>
  );
}