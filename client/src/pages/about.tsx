import StaticPage from "@/components/static-page";

export default function AboutPage() {
  return (
    <StaticPage 
      title="About Us" 
      description="Learn about AppMarket, the alternative Android app marketplace for developers and users."
    >
      <p className="lead">
        AppMarket is a leading alternative Android app marketplace designed to empower developers 
        and provide users with a secure, diverse ecosystem of applications.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
      <p>
        Our mission is to create an open and accessible platform that connects innovative
        developers with users searching for quality applications. We believe in fostering a
        community where creativity thrives, and users have access to a wide range of options
        beyond the traditional app stores.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
      <p>
        AppMarket was founded in 2023 by a team of developers who were frustrated with the
        limitations and restrictions of mainstream app stores. We set out to build a platform
        that offers more freedom to developers while ensuring safety and quality for users.
      </p>
      
      <p className="mt-4">
        Since our inception, we've grown to host thousands of applications across diverse
        categories, serving millions of users worldwide. Our platform continues to evolve,
        driven by feedback from our community and our commitment to innovation.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Openness</h3>
          <p>
            We believe in transparency and open communication with our developers and users.
            Our policies and guidelines are clear, and we welcome feedback to improve our platform.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Quality</h3>
          <p>
            We're committed to maintaining high standards for the apps on our platform,
            ensuring users have access to reliable, secure, and valuable applications.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Innovation</h3>
          <p>
            We encourage creative solutions and novel approaches, providing developers
            with the freedom to push boundaries and experiment with new ideas.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Community</h3>
          <p>
            We foster a supportive ecosystem where developers can connect, collaborate,
            and grow together, while users can provide valuable feedback.
          </p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
      <p>
        AppMarket is powered by a diverse team of engineers, designers, and industry experts
        passionate about creating a better app ecosystem. Our headquarters is located in San Francisco,
        with remote team members contributing from around the globe.
      </p>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Join Us</h2>
      <p>
        We're always looking for talented individuals to join our team. Check out our
        <a href="/careers" className="text-primary hover:underline mx-1">careers page</a>
        for current opportunities.
      </p>
      
      <div className="bg-primary/10 p-6 rounded-lg mt-8">
        <h3 className="font-bold text-xl mb-2">Contact Us</h3>
        <p>
          Have questions about AppMarket? We'd love to hear from you!
          Visit our <a href="/contact" className="text-primary hover:underline">contact page</a> to
          get in touch with our team.
        </p>
      </div>
    </StaticPage>
  );
}