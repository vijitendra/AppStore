import { ReactNode } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface StaticPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function StaticPage({ title, description, children }: StaticPageProps) {
  return (
    <>
      <Helmet>
        <title>{title} - AppMarket</title>
        <meta name="description" content={description} />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
            <div className="prose prose-lg max-w-none">
              {children}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}