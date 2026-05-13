import AboutCta from "./_components/about-cta"
import AboutFeatures from "./_components/about-features"
import AboutHero from "./_components/about-hero"
import AboutMission from "./_components/about-mission"
import AboutStats from "./_components/about-stats"
import AboutTeam from "./_components/about-team"
import AboutValues from "./_components/about-values"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-8 pb-16">
        <div className="container">
          <AboutHero />
          <AboutMission />
          <AboutStats />
          <AboutFeatures />
          <AboutValues />
          <AboutTeam />
          <AboutCta />
        </div>
      </div>
    </div>
  )
}
